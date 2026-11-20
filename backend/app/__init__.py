import sys

if sys.version_info >= (3, 14):
    raise RuntimeError(
        "Food Store necesita Python 3.11 a 3.13: SQLModel 0.0.22 no funciona con Python 3.14. "
        "Creá el entorno virtual con una versión compatible (ver README)."
    )