"""
Service para lógica de negocio de Listings.

Centraliza las reglas de negocio y coordina operaciones complejas.
"""
import logging
from typing import List, Optional, Tuple
from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func
from fastapi import UploadFile, HTTPException, status

from app.models.listing import Listing, ListingStatusEnum
from app.models.listing_image import ListingImage
from app.models.category import Category, ListingTypeEnum
from app.models.user import User
from app.schemas.listing import (
    ListingCreate, ListingUpdate, ListingFilters, ListingStatusUpdate
)
from app.services.aws_s3_service import S3Service

logger = logging.getLogger(__name__)


class ListingService:
    """
    Servicio para gestionar la lógica de negocio de listings.
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.s3_service = S3Service()
    
    def create_listing(
        self,
        listing_data: ListingCreate,
        seller_id: int
    ) -> Listing:
        """
        Crea una nueva publicación con validaciones de negocio.
        
        Args:
            listing_data: Datos de la publicación.
            seller_id: ID del vendedor.
            
        Returns:
            Listing creado.
            
        Raises:
            HTTPException: Si hay errores de validación.
        """
        # Validar que la categoría existe y coincide con el tipo
        self._validate_category(listing_data.category_id, listing_data.listing_type)
        
        # Validar que el usuario existe y está activo
        self._validate_seller(seller_id)
        
        # Crear el listing
        db_listing = Listing(
            seller_id=seller_id,
            category_id=listing_data.category_id,
            listing_type=listing_data.listing_type,
            title=listing_data.title,
            description=listing_data.description,
            price=listing_data.price,
            price_unit=listing_data.price_unit,
            quantity=listing_data.quantity,
            origin_description=listing_data.origin_description,
            location_address_id=listing_data.location_address_id,
            status=ListingStatusEnum.PENDING  # Siempre inicia en PENDING
        )
        
        self.db.add(db_listing)
        self.db.commit()
        self.db.refresh(db_listing)
        
        logger.info(f"Listing {db_listing.listing_id} creado por seller {seller_id}")
        
        return db_listing
    
    def get_listing_by_id(
        self,
        listing_id: int,
        include_inactive: bool = False
    ) -> Optional[Listing]:
        """
        Obtiene un listing por ID con sus imágenes.
        
        Args:
            listing_id: ID del listing.
            include_inactive: Si True, incluye listings inactivos.
            
        Returns:
            Listing encontrado o None.
        """
        query = self.db.query(Listing).options(
            joinedload(Listing.images),
            joinedload(Listing.category),
            joinedload(Listing.seller)
        ).filter(Listing.listing_id == listing_id)
        
        if not include_inactive:
            query = query.filter(Listing.status == ListingStatusEnum.ACTIVE)
        
        return query.first()
    
    def get_public_listings(
        self,
        filters: ListingFilters,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[Listing], int]:
        """
        Obtiene listado público de listings con filtros.
        
        Args:
            filters: Filtros de búsqueda.
            page: Número de página.
            page_size: Tamaño de página.
            
        Returns:
            Tupla con (lista de listings, total de registros).
        """
        query = self.db.query(Listing).options(
            joinedload(Listing.images)
        ).filter(Listing.status == ListingStatusEnum.ACTIVE)
        
        # Aplicar filtros
        query = self._apply_filters(query, filters)
        
        # Obtener total
        total = query.count()
        
        # Aplicar paginación
        skip = (page - 1) * page_size
        listings = query.order_by(Listing.created_at.desc()).offset(skip).limit(page_size).all()
        
        return listings, total
    
    def get_seller_listings(
        self,
        seller_id: int,
        status_filter: Optional[ListingStatusEnum] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[Listing], int]:
        """
        Obtiene listings de un vendedor específico.
        
        Args:
            seller_id: ID del vendedor.
            status_filter: Filtro opcional por estado.
            page: Número de página.
            page_size: Tamaño de página.
            
        Returns:
            Tupla con (lista de listings, total de registros).
        """
        query = self.db.query(Listing).options(
            joinedload(Listing.images)
        ).filter(Listing.seller_id == seller_id)
        
        if status_filter:
            query = query.filter(Listing.status == status_filter)
        
        total = query.count()
        
        skip = (page - 1) * page_size
        listings = query.order_by(Listing.created_at.desc()).offset(skip).limit(page_size).all()
        
        return listings, total
    
    def update_listing(
        self,
        listing_id: int,
        listing_data: ListingUpdate,
        seller_id: int
    ) -> Listing:
        """
        Actualiza un listing existente.
        
        Args:
            listing_id: ID del listing.
            listing_data: Datos actualizados.
            seller_id: ID del vendedor (para validación).
            
        Returns:
            Listing actualizado.
            
        Raises:
            HTTPException: Si el listing no existe o no tiene permisos.
        """
        db_listing = self.get_listing_by_id(listing_id, include_inactive=True)
        
        if not db_listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing no encontrado"
            )
        
        # Verificar permisos
        if db_listing.seller_id != seller_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para actualizar este listing"
            )
        
        # No permitir editar listings rechazados
        if db_listing.status == ListingStatusEnum.REJECTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pueden editar listings rechazados"
            )
        
        # Actualizar campos
        update_data = listing_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_listing, field, value)
        
        self.db.commit()
        self.db.refresh(db_listing)
        
        logger.info(f"Listing {listing_id} actualizado por seller {seller_id}")
        
        return db_listing
    
    def delete_listing(
        self,
        listing_id: int,
        seller_id: int
    ) -> bool:
        """
        Desactiva un listing (soft delete).
        
        Args:
            listing_id: ID del listing.
            seller_id: ID del vendedor (para validación).
            
        Returns:
            True si se desactivó correctamente.
            
        Raises:
            HTTPException: Si no existe o no tiene permisos.
        """
        db_listing = self.get_listing_by_id(listing_id, include_inactive=True)
        
        if not db_listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing no encontrado"
            )
        
        if db_listing.seller_id != seller_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para eliminar este listing"
            )
        
        db_listing.status = ListingStatusEnum.INACTIVE
        self.db.commit()
        
        logger.info(f"Listing {listing_id} desactivado por seller {seller_id}")
        
        return True
    
    async def upload_listing_images(
        self,
        listing_id: int,
        files: List[UploadFile],
        seller_id: int,
        primary_index: int = 0
    ) -> List[ListingImage]:
        """
        Sube múltiples imágenes a S3 y las asocia al listing.
        
        Args:
            listing_id: ID del listing.
            files: Lista de archivos a subir.
            seller_id: ID del vendedor (para validación).
            primary_index: Índice de la imagen principal.
            
        Returns:
            Lista de ListingImage creados.
            
        Raises:
            HTTPException: Si hay errores de validación o upload.
        """
        # Validar que el listing existe y pertenece al seller
        db_listing = self.get_listing_by_id(listing_id, include_inactive=True)
        
        if not db_listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing no encontrado"
            )
        
        if db_listing.seller_id != seller_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para subir imágenes a este listing"
            )
        
        # Validar número de imágenes (máximo 10)
        current_images = len(db_listing.images)
        if current_images + len(files) > 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Máximo 10 imágenes por listing. Ya tienes {current_images}"
            )
        
        # Subir imágenes a S3
        uploaded_images = []
        
        for idx, file in enumerate(files):
            # Validar tipo de archivo
            if not file.content_type.startswith('image/'):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El archivo {file.filename} no es una imagen válida"
                )
            
            # Subir a S3
            try:
                image_url = await self.s3_service.upload_image(
                    file,
                    folder=f"listings/{listing_id}"
                )
            except Exception as e:
                logger.error(f"Error subiendo imagen a S3: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Error al subir la imagen"
                )
            
            # Crear registro en BD
            is_primary = (idx == primary_index) and (current_images == 0)
            
            db_image = ListingImage(
                listing_id=listing_id,
                image_url=image_url,
                is_primary=is_primary
            )
            
            self.db.add(db_image)
            uploaded_images.append(db_image)
        
        self.db.commit()
        
        logger.info(f"{len(uploaded_images)} imágenes subidas al listing {listing_id}")
        
        return uploaded_images
    
    def update_listing_status(
        self,
        listing_id: int,
        status_update: ListingStatusUpdate,
        admin_id: int
    ) -> Listing:
        """
        Actualiza el estado de un listing (moderación por admin).
        
        Args:
            listing_id: ID del listing.
            status_update: Nuevo estado y motivo.
            admin_id: ID del administrador.
            
        Returns:
            Listing actualizado.
            
        Raises:
            HTTPException: Si el listing no existe.
        """
        db_listing = self.get_listing_by_id(listing_id, include_inactive=True)
        
        if not db_listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing no encontrado"
            )
        
        db_listing.status = status_update.status
        
        if status_update.status == ListingStatusEnum.ACTIVE:
            db_listing.approved_by_admin_id = admin_id
        
        self.db.commit()
        self.db.refresh(db_listing)
        
        logger.info(f"Listing {listing_id} cambió a estado {status_update.status} por admin {admin_id}")
        
        return db_listing
    
    # ========== MÉTODOS PRIVADOS DE VALIDACIÓN ==========
    
    def _validate_category(self, category_id: int, listing_type: ListingTypeEnum) -> None:
        """Valida que la categoría existe y coincide con el tipo."""
        category = self.db.query(Category).filter(Category.category_id == category_id).first()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Categoría no encontrada"
            )
        
        if category.type != listing_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"La categoría debe ser de tipo {listing_type.value}"
            )
    
    def _validate_seller(self, seller_id: int) -> None:
        """Valida que el vendedor existe y está activo."""
        seller = self.db.query(User).filter(User.user_id == seller_id).first()
        
        if not seller:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuario no encontrado"
            )
        
        from app.models.user import UserStatusEnum
        if seller.status != UserStatusEnum.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tu cuenta debe estar activa para crear listings"
            )
    
    def _apply_filters(self, query, filters: ListingFilters):
        """Aplica filtros de búsqueda a la query."""
        if filters.listing_type:
            query = query.filter(Listing.listing_type == filters.listing_type)
        
        if filters.category_id:
            query = query.filter(Listing.category_id == filters.category_id)
        
        if filters.min_price:
            query = query.filter(Listing.price >= filters.min_price)
        
        if filters.max_price:
            query = query.filter(Listing.price <= filters.max_price)
        
        if filters.search:
            search_filter = or_(
                Listing.title.ilike(f"%{filters.search}%"),
                Listing.description.ilike(f"%{filters.search}%")
            )
            query = query.filter(search_filter)
        
        if filters.seller_id:
            query = query.filter(Listing.seller_id == filters.seller_id)
        
        return query