from typing import Callable, Optional

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Una transacción = una sesión + sus repositorios.

    Uso (desde el Service):
        with self.uow as uow:
            ...reglas de negocio con uow.<repositorio>...
            return Schema.model_validate(objeto)   # dentro del bloque

    __enter__ abre la sesión; __exit__ hace commit si el bloque terminó bien,
    rollback si hubo una excepción, y siempre close. Nadie más llama a commit().
    """

    session: Session

    def __init__(self, factory: Callable[[], Session] = session_factory) -> None:
        self._factory = factory
        self._session: Optional[Session] = None

    def __enter__(self):
        self.session = self._factory()
        self._session = self.session
        self._create_repositories(self.session)
        return self

    def __exit__(self, exc_type, exc, tb) -> bool:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
        return False  # no traga la excepción: el Router la traduce a HTTP

    def _create_repositories(self, session: Session) -> None:
        """Hook: cada módulo crea acá sus repositorios sobre la misma sesión."""
