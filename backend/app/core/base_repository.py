from typing import Any, Generic, Optional, Type, TypeVar

from sqlmodel import Session, SQLModel, select

ModelT = TypeVar("ModelT", bound=SQLModel)


class BaseRepository(Generic[ModelT]):
    """Acceso a datos de UNA tabla. Sin reglas de negocio y sin commit:
    el commit es responsabilidad exclusiva del Unit of Work."""

    def __init__(self, session: Session, model: Type[ModelT]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, entity_id: Any) -> Optional[ModelT]:
        return self.session.get(self.model, entity_id)

    def get_all(self, skip: int = 0, limit: int = 100) -> list[ModelT]:
        statement = select(self.model).offset(skip).limit(limit)
        return list(self.session.exec(statement).all())

    def add(self, entity: ModelT) -> ModelT:
        self.session.add(entity)
        self.session.flush()  # asigna el id sin cerrar la transacción
        return entity

    def delete(self, entity: ModelT) -> None:
        self.session.delete(entity)
        self.session.flush()
