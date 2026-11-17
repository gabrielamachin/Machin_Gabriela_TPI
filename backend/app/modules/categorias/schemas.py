from typing import Optional

from pydantic import ConfigDict
from sqlmodel import Field, SQLModel


class CategoriaCreate(SQLModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: str = Field(min_length=2, max_length=100)
    descripcion: Optional[str] = None


class CategoriaUpdate(SQLModel):
    """PUT con actualización parcial: solo se modifican los campos enviados."""

    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: Optional[str] = Field(default=None, min_length=2, max_length=100)
    descripcion: Optional[str] = None


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    activo: bool
