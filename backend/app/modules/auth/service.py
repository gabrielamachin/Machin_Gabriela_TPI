from fastapi import HTTPException, status

from app.core.deps import CUENTA_DESACTIVADA
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import ROLE_USER, Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    """En auth se admite lanzar HTTPException desde el Service (consigna)."""

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def register(self, data: UserCreate) -> UserPublic:
        """Registro público: siempre crea un usuario con rol `user`."""
        email = data.email.lower()
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username) is not None:
                raise HTTPException(status.HTTP_409_CONFLICT, "El nombre de usuario ya existe")
            if uow.usuarios.get_by_email(email) is not None:
                raise HTTPException(status.HTTP_409_CONFLICT, "El email ya está registrado")
            usuario = Usuario(
                username=data.username,
                full_name=data.full_name,
                email=email,
                hashed_password=hash_password(data.password),
                role=ROLE_USER,
            )
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def login(self, username: str, password: str) -> str:
        """Devuelve el JWT. 401 credenciales incorrectas; 400 cuenta desactivada."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            # Primero la contraseña: así no se revela si una cuenta desactivada existe.
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise HTTPException(
                    status.HTTP_401_UNAUTHORIZED,
                    "Credenciales incorrectas",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            if usuario.disabled:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, CUENTA_DESACTIVADA)
            return create_access_token(usuario.username)
