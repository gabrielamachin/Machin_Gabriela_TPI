from typing import Optional

from app.modules.productos.service import ProductoNoEncontrado

from .models import PENDIENTE, DetallePedido, Pedido
from .schemas import PedidoCreate, PedidoRead, PedidosPaginados
from .unit_of_work import PedidoUnitOfWork


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


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

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
