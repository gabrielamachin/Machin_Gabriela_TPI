from datetime import datetime
from typing import Optional

from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository

from .models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def _listar(
        self,
        usuario_id: Optional[int],
        estado: Optional[str],
        skip: int,
        limit: int,
    ) -> tuple[list[Pedido], int]:
        condiciones = []
        if usuario_id is not None:
            condiciones.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            condiciones.append(Pedido.estado == estado)

        total = self.session.exec(select(func.count()).select_from(Pedido).where(*condiciones)).one()
        items = self.session.exec(
            select(Pedido)
            .where(*condiciones)
            .options(selectinload(Pedido.items))  # type: ignore[arg-type]
            .order_by(col(Pedido.created_at).desc(), col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return list(items), total

    def list_by_usuario(
        self, usuario_id: int, estado: Optional[str] = None, skip: int = 0, limit: int = 20
    ) -> tuple[list[Pedido], int]:
        """Pedidos de un usuario (más recientes primero). Devuelve (items, total)."""
        return self._listar(usuario_id, estado, skip, limit)

    def list_all(
        self, estado: Optional[str] = None, skip: int = 0, limit: int = 20
    ) -> tuple[list[Pedido], int]:
        """Todos los pedidos (vista del admin). Devuelve (items, total)."""
        return self._listar(None, estado, skip, limit)

    # --- Consultas para el resumen del panel ---

    def count_by_estado(self) -> dict[str, int]:
        """Cantidad de pedidos por estado. Los estados sin pedidos no aparecen."""
        filas = self.session.exec(
            select(Pedido.estado, func.count()).group_by(Pedido.estado)
        ).all()
        return {estado: cantidad for estado, cantidad in filas}

    def count_desde(self, desde: datetime) -> int:
        """Pedidos creados desde `desde` (datetime naive en UTC, como `utcnow`)."""
        return self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        ).one()

    def sum_total_by_estado(self, estado: str) -> float:
        """Suma de `total` de los pedidos en un estado (0.0 si no hay)."""
        suma = self.session.exec(
            select(func.sum(Pedido.total)).where(Pedido.estado == estado)
        ).one()
        return float(suma or 0.0)
