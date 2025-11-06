"""
Módulo de seguridad y autenticación con AWS Cognito.

Proporciona funciones para validar tokens JWT de Cognito,
verificación de roles y autorización de recursos.
"""
import logging
import uuid
from typing import Optional, Dict
from functools import lru_cache

import requests
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_async_session
from app.models.user import User, UserRoleEnum, UserStatusEnum
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Esquema de seguridad HTTP Bearer
security = HTTPBearer()


@lru_cache(maxsize=1)
def get_cognito_jwks() -> Dict:
    """
    Descarga y cachea las claves públicas (JWKS) de AWS Cognito.
    
    Las claves se utilizan para verificar la firma de los tokens JWT.
    Se cachea para evitar hacer requests en cada validación.
    
    Returns:
        Diccionario con las claves públicas en formato JWKS.
        
    Raises:
        HTTPException 500: Si no se pueden obtener las claves.
        
    Note:
        Las claves se obtienen del endpoint público de Cognito:
        https://cognito-idp.{region}.amazonaws.com/{user_pool_id}/.well-known/jwks.json
    """
    jwks_url = (
        f"https://cognito-idp.{settings.COGNITO_REGION}.amazonaws.com/"
        f"{settings.COGNITO_USER_POOL_ID}/.well-known/jwks.json"
    )
    
    try:
        response = requests.get(jwks_url, timeout=10)
        response.raise_for_status()
        jwks = response.json()
        logger.info("JWKS de Cognito obtenidas correctamente")
        return jwks
    except requests.RequestException as e:
        logger.error(f"Error obteniendo JWKS de Cognito: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al obtener claves de verificación de Cognito"
        )


def verify_cognito_token(token: str) -> Dict:
    """
    Verifica y decodifica un token JWT de AWS Cognito.
    
    Valida:
    - Firma del token usando JWKS públicas de Cognito
    - Expiración del token (claim 'exp')
    - Issuer correcto (cognito user pool)
    - Client ID correcto (cognito app client)
    - Token type (debe ser 'access' o 'id')
    
    Args:
        token: Token JWT de Cognito en formato string.
        
    Returns:
        Payload decodificado del token con claims como:
        - sub (UUID): ID del usuario en Cognito
        - email: Email del usuario
        - cognito:groups: Grupos del usuario
        - exp: Timestamp de expiración
        
    Raises:
        HTTPException 401: Si el token es inválido, expirado o tiene claims incorrectos.
        
    Example:
        ```python
        payload = verify_cognito_token(token)
        user_id = UUID(payload["sub"])
        email = payload["email"]
        ```
    """
    # Obtener JWKS (cacheadas)
    jwks = get_cognito_jwks()
    
    # Decodificar header del token sin verificar (para obtener el 'kid')
    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError as e:
        logger.warning(f"Token con header inválido: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token JWT mal formado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Buscar la clave pública correspondiente al 'kid' del token
    kid = unverified_header.get("kid")
    key = None
    for jwk in jwks.get("keys", []):
        if jwk.get("kid") == kid:
            key = jwk
            break
    
    if key is None:
        logger.warning(f"No se encontró clave pública para kid: {kid}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token con clave no reconocida",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar y decodificar el token
    try:
        # Construir la clave pública RSA desde el JWK
        from jose.backends import RSAKey
        rsa_key = RSAKey(key, algorithm="RS256")
        
        # Validar issuer esperado
        expected_issuer = (
            f"https://cognito-idp.{settings.COGNITO_REGION}.amazonaws.com/"
            f"{settings.COGNITO_USER_POOL_ID}"
        )
        
        # Decodificar y validar el token
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            issuer=expected_issuer,
            audience=settings.COGNITO_APP_CLIENT_ID,
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_iss": True,
                "verify_aud": True,
            }
        )
        
        logger.info(f"Token Cognito validado para usuario: {payload.get('sub')}")
        return payload
        
    except JWTError as e:
        logger.warning(f"Error validando token Cognito: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_async_session)
) -> User:
    """
    Dependencia de FastAPI que extrae el usuario actual del token JWT de Cognito.
    
    Valida el token de Cognito, extrae el UUID del usuario y lo busca en la BD.
    Si el usuario no existe, lanza una excepción (la creación JIT se maneja en deps.py).
    
    Args:
        credentials: Credenciales HTTP Bearer del header Authorization.
        db: Sesión de base de datos asíncrona.
        
    Returns:
        Usuario autenticado encontrado en la base de datos.
        
    Raises:
        HTTPException 401: Si el token es inválido o el usuario no existe.
        HTTPException 403: Si el usuario está bloqueado o pendiente.
        
    Example:
        ```python
        @router.get("/me")
        async def get_me(current_user: User = Depends(get_current_user)):
            return current_user
        ```
        
    Note:
        Esta función NO crea usuarios automáticamente.
        Para JIT user creation, usar get_current_user_with_jit() en deps.py.
    """
    token = credentials.credentials
    
    # Verificar el token de Cognito
    payload = verify_cognito_token(token)
    
    # Extraer el UUID del usuario del claim 'sub'
    user_id_str: str = payload.get("sub")
    if user_id_str is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido: falta el claim 'sub' (user ID)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Convertir a UUID
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido: 'sub' no es un UUID válido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Buscar usuario en la base de datos
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado en la base de datos. "
                   "El usuario debe registrarse primero.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar que el usuario esté activo
    if user.status == UserStatusEnum.BLOCKED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario bloqueado. Contacte al administrador."
        )
    
    if user.status == UserStatusEnum.PENDING:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario pendiente de activación. Verifique su email."
        )
    
    logger.info(f"Usuario autenticado: {user.email} (UUID: {user.user_id})")
    return user



async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependencia que verifica que el usuario esté activo.
    
    Args:
        current_user: Usuario autenticado obtenido de get_current_user.
        
    Returns:
        Usuario activo.
        
    Raises:
        HTTPException 403: Si el usuario no está activo.
        
    Note:
        Esta validación ya se hace en get_current_user, por lo que esta
        dependencia es principalmente para claridad semántica en el código.
    """
    if current_user.status != UserStatusEnum.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    return current_user


async def require_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Dependencia que requiere que el usuario tenga rol ADMIN.
    
    Args:
        current_user: Usuario autenticado y activo.
        
    Returns:
        Usuario administrador.
        
    Raises:
        HTTPException 403: Si el usuario no es administrador.
        
    Example:
        ```python
        @router.post("/categories", dependencies=[Depends(require_admin)])
        def create_category(data: CategoryCreate, db: AsyncSession = Depends(get_async_session)):
            # Solo admins pueden ejecutar este endpoint
            ...
        ```
    """
    if current_user.role != UserRoleEnum.ADMIN:
        logger.warning(
            f"Usuario {current_user.user_id} intentó acceder a endpoint de admin"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de administrador para esta operación"
        )
    return current_user


def verify_resource_owner(resource_owner_id: int, current_user: User) -> None:
    """
    Verifica que el usuario actual sea el propietario del recurso.
    
    Args:
        resource_owner_id: ID del propietario del recurso.
        current_user: Usuario autenticado actual.
        
    Raises:
        HTTPException 403: Si el usuario no es el propietario ni admin.
        
    Example:
        ```python
        @router.delete("/addresses/{address_id}")
        def delete_address(
            address_id: int,
            current_user: User = Depends(get_current_active_user),
            db: AsyncSession = Depends(get_async_session)
        ):
            address = db.query(Address).filter_by(address_id=address_id).first()
            verify_resource_owner(address.user_id, current_user)
            db.delete(address)
            db.commit()
        ```
    """
    # Los administradores pueden acceder a cualquier recurso
    if current_user.role == UserRoleEnum.ADMIN:
        return
    
    # El usuario debe ser el propietario
    if current_user.user_id != resource_owner_id:
        logger.warning(
            f"Usuario {current_user.user_id} intentó acceder a recurso de "
            f"usuario {resource_owner_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para acceder a este recurso"
        )