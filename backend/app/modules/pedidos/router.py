from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import AdminUser, get_current_active_user
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import ROLE_ADMIN, Usuario

from .schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from .service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ReglaDeNegocio,
)
from .unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]
CurrentUser = Annotated[Usuario, Depends(get_current_active_user)]

# Excepciones de dominio que el Router traduce a HTTP.
ERRORES_DOMINIO = (PedidoNoEncontrado, ProductoNoEncontrado, PedidoAjeno, ReglaDeNegocio)


def _traducir(exc: Exception) -> HTTPException:
    if isinstance(exc, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status.HTTP_404_NOT_FOUND, str(exc))
    if isinstance(exc, PedidoAjeno):
        return HTTPException(status.HTTP_403_FORBIDDEN, str(exc))
    return HTTPException(status.HTTP_400_BAD_REQUEST, str(exc))  # reglas de negocio


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreate, user: CurrentUser, service: ServiceDep) -> PedidoRead:
    try:
        return service.crear(user.id, data)  # type: ignore[arg-type]
    except ERRORES_DOMINIO as exc:
        raise _traducir(exc)


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    user: CurrentUser,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: Optional[EstadoPedido] = None,
) -> PedidosPaginados:
    return service.listar(user.id, user.role == ROLE_ADMIN, estado, skip, limit)  # type: ignore[arg-type]


# Importante: /resumen se declara ANTES de /{pedido_id}.
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_: AdminUser, service: ServiceDep) -> ResumenPedidos:
    return service.resumen()


@router.get("/mis-pedidos", response_model=PedidosPaginados)
def listar_mis_pedidos(
    user: CurrentUser,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: Optional[EstadoPedido] = None,
) -> PedidosPaginados:
    return service.listar(user.id, False, estado, skip, limit)  # type: ignore[arg-type]


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(pedido_id: int, user: CurrentUser, service: ServiceDep) -> PedidoRead:
    try:
        return service.obtener(pedido_id, user.id, user.role == ROLE_ADMIN)  # type: ignore[arg-type]
    except ERRORES_DOMINIO as exc:
        raise _traducir(exc)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(
    pedido_id: int, data: CambioEstado, _: AdminUser, service: ServiceDep
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except ERRORES_DOMINIO as exc:
        raise _traducir(exc)


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(pedido_id: int, user: CurrentUser, service: ServiceDep) -> PedidoRead:
    try:
        return service.cancelar_propio(pedido_id, user.id)  # type: ignore[arg-type]
    except ERRORES_DOMINIO as exc:
        raise _traducir(exc)
