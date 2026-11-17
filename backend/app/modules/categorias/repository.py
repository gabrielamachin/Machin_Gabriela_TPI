from typing import Optional

from sqlmodel import Session, select

from app.core.base_repository import BaseRepository

from .models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        """Busca por nombre sin filtrar por `activo`: la baja lógica no libera el nombre único."""
        return self.session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()

    def get_activa(self, categoria_id: int) -> Optional[Categoria]:
        """Devuelve la categoría solo si existe y está activa (una dada de baja es 'inexistente')."""
        categoria = self.get_by_id(categoria_id)
        return categoria if categoria is not None and categoria.activo else None

    def list_activas(self) -> list[Categoria]:
        statement = select(Categoria).where(Categoria.activo == True).order_by(Categoria.nombre)  # noqa: E712
        return list(self.session.exec(statement).all())
