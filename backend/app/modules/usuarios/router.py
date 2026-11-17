from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.deps import require_role

from .models import ROLE_ADMIN, Usuario
from .schemas import UserPublic
from .service import UsuarioService
from .unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios (admin)"])

require_admin = require_role([ROLE_ADMIN])
AdminDep = Annotated[Usuario, Depends(require_admin)]


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


UsuarioServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get("", response_model=list[UserPublic])
def listar_usuarios(_: AdminDep, service: UsuarioServiceDep) -> list[UserPublic]:
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(usuario_id: int, _: AdminDep, service: UsuarioServiceDep) -> UserPublic:
    return service.activar(usuario_id)


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int, admin: AdminDep, service: UsuarioServiceDep
) -> UserPublic:
    return service.desactivar(usuario_id, admin.id)  # type: ignore[arg-type]
