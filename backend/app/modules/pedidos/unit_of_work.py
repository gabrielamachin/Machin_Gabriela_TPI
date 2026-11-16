from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.productos.repository import ProductoRepository

from .repository import PedidoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Pedidos y productos comparten la MISMA sesión: crear el pedido y descontar
    el stock ocurren en una sola transacción (RN-01 / RN-03)."""

    pedidos: PedidoRepository
    productos: ProductoRepository

    def _create_repositories(self, session: Session) -> None:
        self.pedidos = PedidoRepository(session)
        self.productos = ProductoRepository(session)
