# Trabajo Práctico Integrador - Programación IV

Sistema de pedidos de comida **Foodstore**: backend **FastAPI + SQLModel** y frontend **React + TypeScript**.

- **Estudiante:** Gabriela Machin
- **Repositorio:** https://github.com/gabrielamachin/Machin_Gabriela_TPI
- **Video de demostración:** _(completar con el link)_

## Requisitos

- Python 3.11 a 3.13
- PostgreSQL 15 o superior
- Node.js 20.19 o superior y pnpm 9 o superior

## Backend

Desde la carpeta `backend/`:

```bash
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # Windows: copy .env.example .env
```

Editar `.env` (ver la tabla de variables) y cargar los datos iniciales:

```bash
python -m app.db.seed
uvicorn app.main:app --reload
```

La API queda en `http://localhost:8000/api/v1` y la documentación en
`http://localhost:8000/docs` y `http://localhost:8000/redoc`.

### Variables de entorno (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://user:pass@localhost:5432/foodstore_db` (desarrollo: `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Firma del JWT, mínimo 32 caracteres | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |
| `COOKIE_SECURE` | `true` solo si se sirve por https | `false` |

### Usuario del seed

`python -m app.db.seed` es idempotente: crea el administrador, 4 categorías y 9 productos con stock.

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | `admin` |

Los clientes se crean desde el registro público (rol `user`).

## Frontend
