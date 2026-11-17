from typing import Optional

from app.core.utils import utcnow
from app.modules.productos.service import ProductoNoEncontrado

from .models import (
    CANCELADO,
    ENTREGADO,
    EN_PREPARACION,
    PENDIENTE,
    DetallePedido,
    Pedido,
)
from .schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from .unit_of_work import PedidoUnitOfWork

# Máquina de estados (RN-02): estado actual -> estados a los que puede pasar.
# ENTREGADO y CANCELADO son terminales.
TRANSICIONES: dict[str, set[str]] = {
    PENDIENTE: {EN_PREPARACION, CANCELADO},
    EN_PREPARACION: {ENTREGADO, CANCELADO},
    ENTREGADO: set(),
    CANCELADO: set(),
}


# --- Excepciones de dominio: el Router las traduce a HTTP ---
class PedidoNoEncontrado(Exception):  # 404
    def __init__(self) -> None:
        super().__init__("Pedido no encontrado")


class PedidoAjeno(Exception):  # 403
    def __init__(self) -> None:
        super().__init__("No tenés permiso para acceder a este pedido")


class ReglaDeNegocio(Exception):
    """Base de las reglas de negocio incumplidas (400)."""


class ProductoRepetido(ReglaDeNegocio):
    def __init__(self) -> None:
        super().__init__("No se puede repetir un producto en el pedido")


class ProductoNoDisponible(ReglaDeNegocio):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(ReglaDeNegocio):
    def __init__(self, nombre: str, disponible: int, pedido: int) -> None:
        super().__init__(
            f"Stock insuficiente para '{nombre}': disponible {disponible}, solicitado {pedido}"
        )


class TransicionInvalida(ReglaDeNegocio):
    def __init__(self, actual: str, nuevo: str) -> None:
        super().__init__(f"Transición inválida: no se puede pasar de {actual} a {nuevo}")


class CancelacionNoPermitida(ReglaDeNegocio):
    def __init__(self) -> None:
        super().__init__("Solo se puede cancelar un pedido en estado PENDIENTE")


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ------------------------------------------------------------------ crear
    def crear(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        """RN-01: todo ocurre en una sola transacción; si algo falla no se persiste nada
        (tampoco el descuento de stock)."""
        ids = [item.producto_id for item in data.items]
        if len(ids) != len(set(ids)):
            raise ProductoRepetido()

        with self.uow as uow:
            pedido = Pedido(
                usuario_id=usuario_id,
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                estado=PENDIENTE,
                total=0.0,
            )
            uow.pedidos.add(pedido)  # INSERT (obtiene el id)

            total = 0.0
            # Se recorre ordenado por producto_id: pedidos simultáneos bloquean las filas
            # en el mismo orden y no se produce un deadlock.
            for item in sorted(data.items, key=lambda i: i.producto_id):
                producto = uow.productos.get_for_update(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado()
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)

                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,  # type: ignore[arg-type]
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,  # copia: no cambia si el producto cambia
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)  # UPDATE del total + flush de las líneas y del stock
            return PedidoRead.model_validate(pedido)

    # --------------------------------------------------------------- consultas
    def listar(
        self,
        usuario_id: int,
        es_admin: bool,
        estado: Optional[str],
        skip: int,
        limit: int,
    ) -> PedidosPaginados:
        """RN-04: el cliente ve solo los suyos; el admin ve todos."""
        with self.uow as uow:
            if es_admin:
                pedidos, total = uow.pedidos.list_all(estado, skip, limit)
            else:
                pedidos, total = uow.pedidos.list_by_usuario(usuario_id, estado, skip, limit)
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in pedidos]
            )

    def obtener(self, pedido_id: int, usuario_id: int, es_admin: bool) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado()
            if not es_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    # ----------------------------------------------------------------- estados
    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        """RN-02 / RN-03 (admin): avanza o cancela según TRANSICIONES."""
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado()
            if nuevo_estado not in TRANSICIONES[pedido.estado]:  # se valida ANTES de modificar
                raise TransicionInvalida(pedido.estado, nuevo_estado)
            self._aplicar_estado(uow, pedido, nuevo_estado)
            return PedidoRead.model_validate(pedido)

    def cancelar_propio(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        """RN-03 / RN-04: el dueño cancela su pedido, solo si está en PENDIENTE."""
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado()
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            if pedido.estado != PENDIENTE:
                raise CancelacionNoPermitida()
            self._aplicar_estado(uow, pedido, CANCELADO)
            return PedidoRead.model_validate(pedido)

    def _aplicar_estado(self, uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str) -> None:
        if nuevo_estado == CANCELADO:
            # RN-03: el stock se restituye en la MISMA transacción que cambia el estado.
            # Orden por producto_id para bloquear siempre en el mismo orden (sin deadlocks).
            for linea in sorted(pedido.items, key=lambda d: d.producto_id):
                producto = uow.productos.get_for_update(linea.producto_id)
                if producto is not None:  # se restituye aunque el producto esté dado de baja
                    producto.stock += linea.cantidad
        pedido.estado = nuevo_estado
        pedido.updated_at = utcnow()
        uow.pedidos.add(pedido)

    # ----------------------------------------------------------------- resumen
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            por_estado = uow.pedidos.count_by_estado()
            inicio_hoy = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=por_estado.get(PENDIENTE, 0),
                en_preparacion=por_estado.get(EN_PREPARACION, 0),
                entregados=por_estado.get(ENTREGADO, 0),
                cancelados=por_estado.get(CANCELADO, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=uow.pedidos.sum_total_by_estado(ENTREGADO),
            )
