from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    __tablename__ = "categoria"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True)  # 2 a 100 caracteres: se valida en los schemas
    descripcion: Optional[str] = Field(default=None)
    activo: bool = Field(default=True)  # baja lógica

    productos: list["Producto"] = Relationship(back_populates="categoria")
