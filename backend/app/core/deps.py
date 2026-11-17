"""Dependencias de sesión y rol: get_current_user, get_current_active_user y require_role."""
from typing import Annotated, Callable, Optional, Sequence

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.core.security import decode_access_token
from app.modules.usuarios.models import ROLE_ADMIN, Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


class OAuth2PasswordBearerCookie(OAuth2PasswordBearer):
    """Como OAuth2PasswordBearer, pero el token se lee de la cookie HttpOnly.
    Si no hay cookie, prueba el encabezado Authorization (útil en /docs)."""

    async def __call__(self, request: Request) -> Optional[str]:
        token = request.cookies.get(settings.COOKIE_NAME)
        if token:
            return token
        return await super().__call__(request)


oauth2_scheme = OAuth2PasswordBearerCookie(
    tokenUrl=f"{settings.API_PREFIX}/auth/token", auto_error=False
)


def _no_autenticado(detalle: str) -> HTTPException:
    return HTTPException(
        status.HTTP_401_UNAUTHORIZED, detalle, headers={"WWW-Authenticate": "Bearer"}
    )


def get_current_user(token: Annotated[Optional[str], Depends(oauth2_scheme)]) -> Usuario:
    """401 si falta la cookie, el token es inválido, venció o el usuario no existe."""
    if not token:
        raise _no_autenticado("No autenticado")
    username = decode_access_token(token)
    if username is None:
        raise _no_autenticado("Sesión inválida o vencida")
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(username)
    if usuario is None:
        raise _no_autenticado("Sesión inválida o vencida")
    return usuario


def get_current_active_user(
    current_user: Annotated[Usuario, Depends(get_current_user)],
) -> Usuario:
    """400 si la cuenta está desactivada."""
    if current_user.disabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, CUENTA_DESACTIVADA)
    return current_user


def require_role(roles: Sequence[str]) -> Callable[..., Usuario]:
    """Exige sesión activa y que el rol esté permitido (403 si no)."""

    def verificar_rol(
        current_user: Annotated[Usuario, Depends(get_current_active_user)],
    ) -> Usuario:
        if current_user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No tenés permisos para esta acción")
        return current_user

    return verificar_rol


# Atajo para los endpoints exclusivos del administrador.
require_admin = require_role([ROLE_ADMIN])
AdminUser = Annotated[Usuario, Depends(require_admin)]
