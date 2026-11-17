from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.deps import AdminUser

from .schemas import UserPublic
from .service import UsuarioService
from .unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios (admin)"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


UsuarioServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get("", response_model=list[UserPublic])
def listar_usuarios(_: AdminUser, service: UsuarioServiceDep) -> list[UserPublic]:
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(usuario_id: int, _: AdminUser, service: UsuarioServiceDep) -> UserPublic:
    return service.activar(usuario_id)


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int, admin: AdminUser, service: UsuarioServiceDep
) -> UserPublic:
    return service.desactivar(usuario_id, admin.id)  # type: ignore[arg-type]
