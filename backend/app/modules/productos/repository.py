from typing import Optional

from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository

from .models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_activo(self, producto_id: int) -> Optional[Producto]:
        """Devuelve el producto solo si existe y está activo (uno dado de baja es 'inexistente')."""
        producto = self.get_by_id(producto_id)
        return producto if producto is not None and producto.activo else None

    def search(
        self,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Producto], int]:
        """Productos ACTIVOS filtrados, paginados. Devuelve (items, total sin paginar).

        `search` busca en `nombre` sin distinguir mayúsculas.
        """
        condiciones = [col(Producto.activo).is_(True)]
        if search:
            condiciones.append(col(Producto.nombre).ilike(f"%{search}%"))
        if categoria_id is not None:
            condiciones.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            condiciones.append(Producto.disponible == disponible)

        total = self.session.exec(
            select(func.count()).select_from(Producto).where(*condiciones)
        ).one()
        items = self.session.exec(
            select(Producto)
            .where(*condiciones)
            .options(selectinload(Producto.categoria))  # type: ignore[arg-type]
            .order_by(col(Producto.id))
            .offset(skip)
            .limit(limit)
        ).all()
        return list(items), total
