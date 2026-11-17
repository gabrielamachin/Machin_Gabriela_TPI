from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

from .schemas import MessageResponse
from .service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, service: AuthServiceDep) -> UserPublic:
    try:
        return service.register(data)
    except IntegrityError:
        # Dos registros simultáneos con el mismo username/email: la restricción única
        # salta en el commit (al salir del Unit of Work), después de nuestras validaciones.
        raise HTTPException(status.HTTP_409_CONFLICT, "El usuario ya existe")


@router.post("/token", response_model=MessageResponse)
def login(
    response: Response,
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: AuthServiceDep,
) -> MessageResponse:
    token = service.login(form.username, form.password)
    # El token viaja SOLO en la cookie HttpOnly: no va en el cuerpo ni lo lee el frontend.
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        path="/",
    )
    return MessageResponse(message="Login exitoso")


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response) -> MessageResponse:
    response.delete_cookie(
        key=settings.COOKIE_NAME,
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        path="/",
    )
    return MessageResponse(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(current_user: Annotated[Usuario, Depends(get_current_active_user)]) -> UserPublic:
    return UserPublic.model_validate(current_user)
