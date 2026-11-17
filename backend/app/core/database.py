from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# SQLite necesita check_same_thread=False porque FastAPI usa varios hilos.
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, echo=False, connect_args=connect_args)


def session_factory() -> Session:
    """Crea una sesión nueva. expire_on_commit=False permite leer los objetos
    después del commit sin volver a consultar la base."""
    return Session(engine, expire_on_commit=False)


def create_all_tables() -> None:
    """Crea las tablas que no existan.

    Importar los modelos es lo que los registra en SQLModel.metadata y permite
    resolver las relaciones entre módulos. Deben importarse TODOS antes de la
    primera consulta (la app lo garantiza llamando a esta función al iniciar).
    """
    from app.modules.categorias import models as _categorias  # noqa: F401
    from app.modules.pedidos import models as _pedidos  # noqa: F401
    from app.modules.productos import models as _productos  # noqa: F401
    from app.modules.usuarios import models as _usuarios  # noqa: F401

    SQLModel.metadata.create_all(engine)
