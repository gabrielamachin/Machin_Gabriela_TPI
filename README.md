# Trabajo Práctico Integrador - Programación IV

Sistema de pedidos de comida **Foodstore**: backend **FastAPI + SQLModel** y frontend **React + TypeScript**.

- **Estudiante:** Gabriela Machin
- **Repositorio:** https://github.com/gabrielamachin/Machin_Gabriela_TPI
- **Video de demostración:** https://drive.google.com/file/d/13ZmDUFxiJLrsmPgVL6EP6ei5_xktIGl0/view?usp=sharing

## Requisitos

- Python 3.11 a 3.13
- PostgreSQL 15 o superior
- Node.js 20.19 o superior y pnpm 9 o superior

## Backend

Desde la carpeta `backend/`. **Importante: usar Python 3.11, 3.12 o 3.13.** Con Python 3.14 la
aplicación no arranca, porque SQLModel 0.0.22 no es compatible.

```bash
# Linux / macOS
python3.13 -m venv venv
source venv/bin/activate

# Windows (PowerShell): `py` permite elegir la versión
py -3.13 -m venv venv
venv\Scripts\activate
```

```bash
python --version                  # debe mostrar 3.11, 3.12 o 3.13
pip install -r requirements.txt
cp .env.example .env              # Windows: copy .env.example .env
```

Después de copiarlo, abrir `backend/.env` y completar `SECRET_KEY` (mínimo 32 caracteres) y el
usuario y la contraseña de PostgreSQL en `DATABASE_URL`.

Con la base `foodstore_db` ya creada en PostgreSQL y el `.env` completo (ver la tabla de variables),
cargar los datos iniciales y levantar la API:

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

Desde la carpeta `frontend/` (con el backend ya ejecutándose):

```bash
pnpm install
cp .env.example .env              # Windows: copy .env.example .env
pnpm build                        # verifica los tipos (TypeScript estricto)
pnpm dev
```

La aplicación queda en `http://localhost:5173`. Ese puerto es el que admite el CORS del backend:
si está ocupado, Vite falla en vez de usar otro.

Otros comandos: `pnpm lint` (ESLint, incluye la regla que prohíbe `any`) y `pnpm preview`.

### Variables de entorno (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API, con el prefijo `/api/v1` | `http://localhost:8000/api/v1` |

### Pantallas

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` | Catálogo (paginado en el servidor, búsqueda y filtro por categoría) | Público |
| `/login`, `/register` | Inicio de sesión y registro | Público |
| `/carrito` | Carrito (persiste al recargar) | Público |
| `/checkout` | Confirmar pedido | Sesión |
| `/mis-pedidos` | Mis pedidos, con detalle y cancelación en `PENDIENTE` | Sesión |
| `/admin/resumen` | Indicadores del negocio | admin |
| `/admin/categorias`, `/admin/productos` | ABM, incluido el cambio de stock y disponibilidad | admin |
| `/admin/pedidos` | Pedidos con cambio de estado | admin |
| `/admin/usuarios` | Activar y desactivar usuarios | admin |

## Arquitectura

**Backend** (`backend/app/`): un paquete por dominio en `modules/` (`auth`, `usuarios`, `categorias`,
`productos`, `pedidos`) con la cadena Router → Service → Unit of Work → Repository → Model, e infraestructura
compartida en `core/`. El commit ocurre solo en el `__exit__` del Unit of Work: ningún Service ni Router llama a
`session.commit()`.

**Frontend** (`frontend/src/`): organizado por features (`features/<dominio>/{pages,components,hooks,api,types}`),
con lo transversal en `shared/`, el estado del cliente en `store/` (Zustand: sesión y carrito) y las rutas en
`routes/`. El estado del servidor lo gestiona TanStack Query.

**Sesión:** el JWT viaja en una cookie `HttpOnly`. El frontend nunca lee ni guarda el token; solo conserva en el
navegador los datos básicos del usuario (id, username, nombre completo, email y rol).