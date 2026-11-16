from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel

from app.core.utils import utcnow

ROLE_USER = "user"
ROLE_ADMIN = "admin"


class Usuario(SQLModel, table=True):
    __tablename__ = "usuario"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    full_name: str
    email: str = Field(unique=True, index=True)
    hashed_password: str
    role: str = Field(default=ROLE_USER)
    disabled: bool = Field(default=False)  # baja lógica
    created_at: datetime = Field(default_factory=utcnow)

    # La relación `pedidos: list[Pedido] = Relationship(back_populates="usuario")`
    # se agrega junto con el modelo Pedido (commit de pedidos).
