from fastapi import HTTPException, status

from .schemas import UserPublic
from .unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    """Gestión de usuarios para el admin. En usuarios se admite HTTPException en el Service."""

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_ordenados()]

    def activar(self, usuario_id: int) -> UserPublic:
        """Idempotente: responde igual aunque el usuario ya estuviera activo."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")
            usuario.disabled = False
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        """Idempotente. 404 si no existe; 400 si el admin intenta desactivarse a sí mismo."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")
            if usuario.id == admin_id:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, "Un administrador no puede desactivarse a sí mismo"
                )
            usuario.disabled = True
            return UserPublic.model_validate(usuario)
