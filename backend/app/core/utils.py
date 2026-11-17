from datetime import datetime, timezone


def utcnow() -> datetime:
    """Fecha y hora actual en UTC, SIN zona horaria (naive).

    Las columnas datetime se guardan como TIMESTAMP sin zona. Si se les pasara un
    datetime con zona, PostgreSQL lo convertiría a la zona del servidor y las
    fechas quedarían inconsistentes. Con valores naive en UTC, SQLite y
    PostgreSQL guardan y comparan lo mismo.
    """
    return datetime.now(timezone.utc).replace(tzinfo=None)
