from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_all_tables()
    yield


app = FastAPI(title=settings.APP_NAME, version=settings.VERSION, lifespan=lifespan)

# CORS con credenciales: el navegador envía la cookie HttpOnly desde el frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Todos los endpoints cuelgan de /api/v1; los routers de cada módulo se incluyen acá.
api_router = APIRouter(prefix=settings.API_PREFIX)
api_router.include_router(auth_router)
api_router.include_router(usuarios_router)
app.include_router(api_router)
