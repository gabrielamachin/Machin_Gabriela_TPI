from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import AdminUser

from .schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from .service import CategoriaNoEncontrada, ProductoNoEncontrado, ProductoService
from .unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]


def _no_encontrado(exc: Exception) -> HTTPException:
    return HTTPException(status.HTTP_404_NOT_FOUND, str(exc))


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Optional[str] = None,
    categoria_id: Optional[int] = None,
    disponible: Optional[bool] = None,
) -> ProductosPaginados:
    return service.listar(search, categoria_id, disponible, skip, limit)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, service: ServiceDep) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as exc:
        raise _no_encontrado(exc)


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(data: ProductoCreate, _: AdminUser, service: ServiceDep) -> ProductoRead:
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as exc:
        raise _no_encontrado(exc)


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: int, data: ProductoUpdate, _: AdminUser, service: ServiceDep
) -> ProductoRead:
    try:
        return service.actualizar(producto_id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise _no_encontrado(exc)


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: int, data: ProductoStockUpdate, _: AdminUser, service: ServiceDep
) -> ProductoRead:
    try:
        return service.actualizar_stock(producto_id, data)
    except ProductoNoEncontrado as exc:
        raise _no_encontrado(exc)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(producto_id: int, _: AdminUser, service: ServiceDep) -> None:
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as exc:
        raise _no_encontrado(exc)
