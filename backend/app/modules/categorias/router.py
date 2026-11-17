from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError

from app.core.deps import AdminUser

from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from .unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["categorias"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: ServiceDep) -> list[CategoriaRead]:
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, service: ServiceDep) -> CategoriaRead:
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc))


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(data: CategoriaCreate, _: AdminUser, service: ServiceDep) -> CategoriaRead:
    try:
        return service.crear(data)
    except (NombreDuplicado, IntegrityError):
        # IntegrityError: carrera entre dos altas simultáneas (salta en el commit).
        raise HTTPException(status.HTTP_409_CONFLICT, "Ya existe una categoría con ese nombre")


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(
    categoria_id: int, data: CategoriaUpdate, _: AdminUser, service: ServiceDep
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, data)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc))
    except (NombreDuplicado, IntegrityError):
        raise HTTPException(status.HTTP_409_CONFLICT, "Ya existe una categoría con ese nombre")


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(categoria_id: int, _: AdminUser, service: ServiceDep) -> None:
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc))
