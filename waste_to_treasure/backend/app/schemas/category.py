"""
Esquemas de Pydantic para el modelo Category.

Define los contratos de entrada y salida para las operaciones CRUD 
sobre las categorías en los marketplaces.
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

from app.models.category import ListingTypeEnum


class CategoryBase(BaseModel):
    """
    Esquema base con campos comunes para Category.
    
    Contiene los campos que se usan tanto en creación como actualización.
    """
    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Nombre visible de la categoría",
        examples=["Madera Reciclada", "Textiles"]
    )
    type: ListingTypeEnum = Field(
        ...,
        description="Tipo de marketplace: MATERIAL (B2B) o PRODUCT (B2C)"
    )
    parent_category_id: Optional[int] = Field(
        None,
        ge=1,
        description="ID de la categoría padre para crear jerarquías"
    )


class CategoryCreate(CategoryBase):
    """
    Esquema para crear una nueva categoría.
    
    Usado en: POST /api/v1/categories
    Requiere: Rol ADMIN
    """
    pass


class CategoryUpdate(BaseModel):
    """
    Esquema para actualizar una categoría existente.
    
    Todos los campos son opcionales para permitir actualizaciones parciales.
    
    Usado en: PATCH /api/v1/categories/{category_id}
    Requiere: Rol ADMIN
    """
    name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=100,
        description="Nombre visible de la categoría"
    )
    type: Optional[ListingTypeEnum] = Field(
        None,
        description="Tipo de marketplace"
    )
    parent_category_id: Optional[int] = Field(
        None,
        ge=1,
        description="ID de la categoría padre"
    )


class CategoryInDB(CategoryBase):
    """
    Esquema que representa cómo se almacena Category en la base de datos.
    
    Incluye campos autogenerados como ID y timestamps.
    """
    category_id: int = Field(..., description="Identificador único")
    slug: str = Field(..., description="Slug único para URLs")
    created_at: datetime = Field(..., description="Fecha de creación")
    updated_at: datetime = Field(..., description="Última actualización")
    
    model_config = ConfigDict(from_attributes=True)


class Category(CategoryInDB):
    """
    Esquema de respuesta completo para Category.
    
    Este es el esquema principal que se devuelve al cliente.
    Puede incluir campos computados o relaciones cargadas.
    
    Usado en: Respuestas de GET, POST, PATCH
    """
    # Campo computado: ruta completa de la jerarquía
    full_path: Optional[str] = Field(
        None,
        description="Ruta completa en la jerarquía (ej: 'Electrónica > Móviles')"
    )
    
    # Relaciones (opcionales según lazy loading)
    children: Optional[List["Category"]] = Field(
        None,
        description="Lista de subcategorías hijas"
    )


class CategoryWithChildren(Category):
    """
    Esquema extendido que incluye subcategorías anidadas.
    
    Usado en: GET /api/v1/categories/{category_id}?include_children=true
    """
    children: List["Category"] = Field(
        default_factory=list,
        description="Subcategorías hijas con sus propios hijos"
    )


class CategoryList(BaseModel):
    """
    Esquema de respuesta paginada para listar categorías.
    
    Usado en: GET /api/v1/categories
    """
    items: List[Category] = Field(..., description="Lista de categorías")
    total: int = Field(..., ge=0, description="Total de categorías encontradas")
    page: int = Field(..., ge=1, description="Página actual")
    page_size: int = Field(..., ge=1, le=100, description="Items por página")
    
    model_config = ConfigDict(from_attributes=True)


class CategoryTree(BaseModel):
    """
    Esquema para representar el árbol jerárquico completo de categorías.
    
    Usado en: GET /api/v1/categories/tree
    """
    materials: List[CategoryWithChildren] = Field(
        default_factory=list,
        description="Árbol de categorías del marketplace de materiales"
    )
    products: List[CategoryWithChildren] = Field(
        default_factory=list,
        description="Árbol de categorías del marketplace de productos"
    )


# Configurar referencias circulares para el modelo recursivo
Category.model_rebuild()
CategoryWithChildren.model_rebuild()
