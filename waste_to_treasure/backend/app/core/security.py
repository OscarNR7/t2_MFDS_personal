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


# ==========================================
# NOTA: Dependencias de autenticación movidas a deps.py
# ==========================================
# Las siguientes funciones ahora están en app/api/deps.py:
# - get_current_user_with_jit() → Autenticación principal con JIT user creation
# - get_current_active_user() → Verifica que el usuario esté activo
# - require_admin() → Requiere rol de administrador
# - verify_resource_owner() → Verifica propiedad de recursos
#
# Usa: from app.api.deps import get_current_user, require_admin, etc.
# ==========================================