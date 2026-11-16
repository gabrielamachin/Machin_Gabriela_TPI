from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

from app.core.utils import utcnow

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario

# Estados del pedido (máquina de estados: RN-02)
PENDIENTE = "PENDIENTE"
EN_PREPARACION = "EN_PREPARACION"
ENTREGADO = "ENTREGADO"
CANCELADO = "CANCELADO"
ESTADOS = (PENDIENTE, EN_PREPARACION, ENTREGADO, CANCELADO)

# Formas de pago (RN-06)
EFECTIVO = "EFECTIVO"
TRANSFERENCIA = "TRANSFERENCIA"
FORMAS_PAGO = (EFECTIVO, TRANSFERENCIA)


class Pedido(SQLModel, table=True):
    """Un pedido no se borra: se cancela (RN-05)."""

    __tablename__ = "pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    estado: str = Field(default=PENDIENTE)
    forma_pago: str
    direccion_entrega: str  # 5 a 200 caracteres: se valida en el schema (RN-06)
    notas: Optional[str] = Field(default=None)
    total: float = Field(default=0.0)  # suma de los subtotales; fijo desde la creación
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)

    usuario: Optional["Usuario"] = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    """Línea inmutable: guarda una copia del nombre y del precio del producto (RN-05)."""

    __tablename__ = "detalle_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    producto_id: int = Field(foreign_key="producto.id", index=True)
    cantidad: int  # >= 1: se valida en el schema
    nombre_producto: str  # copia del nombre al momento de la compra
    precio_unitario: float  # copia del precio al momento de la compra
    subtotal: float  # precio_unitario * cantidad

    pedido: Optional["Pedido"] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship(back_populates="detalles")
