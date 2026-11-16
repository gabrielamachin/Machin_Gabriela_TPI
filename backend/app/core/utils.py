from datetime import datetime, timezone


def utcnow() -> datetime:
    """Fecha y hora actual en UTC (para created_at / updated_at)."""
    return datetime.now(timezone.utc)
