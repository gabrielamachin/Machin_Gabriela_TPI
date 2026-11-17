from typing import Optional

from pydantic import ConfigDict, model_validator
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead


class ProductoCreate(SQLModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: str = Field(min_length=1, max_length=150)
    descripcion: Optional[str] = None
    precio_base: float = Field(ge=0)
    imagen_url: Optional[str] = None
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int


class ProductoUpdate(SQLModel):
    """PUT con actualización parcial: solo se modifican los campos enviados."""

    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: Optional[str] = Field(default=None, min_length=1, max_length=150)
    descripcion: Optional[str] = None
    precio_base: Optional[float] = Field(default=None, ge=0)
    imagen_url: Optional[str] = None
    stock: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = None
    categoria_id: Optional[int] = None


class ProductoStockUpdate(SQLModel):
    """PATCH /productos/{id}/stock: stock y/o disponibilidad (al menos uno)."""

    stock: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = None

    @model_validator(mode="after")
    def _al_menos_un_campo(self) -> "ProductoStockUpdate":
        if self.stock is None and self.disponible is None:
            raise ValueError("Indicá al menos 'stock' o 'disponible'")
        return self


class ProductoRead(SQLModel):
    id: int
    categoria_id: int
    nombre: str
    descripcion: Optional[str] = None
    precio_base: float
    imagen_url: Optional[str] = None
    stock: int
    disponible: bool
    activo: bool
    categoria: Optional[CategoriaRead] = None


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
