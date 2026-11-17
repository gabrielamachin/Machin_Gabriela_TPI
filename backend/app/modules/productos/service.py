from typing import Optional

from app.modules.categorias.service import CategoriaNoEncontrada

from .models import Producto
from .schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from .unit_of_work import ProductoUnitOfWork

__all__ = ["ProductoNoEncontrado", "CategoriaNoEncontrada", "ProductoService"]

# Campos que no admiten null en un PUT parcial (null = "no cambiar").
_NO_NULOS = {"nombre", "precio_base", "stock", "disponible", "categoria_id"}


class ProductoNoEncontrado(Exception):
    def __init__(self) -> None:
        super().__init__("Producto no encontrado")


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        search: Optional[str],
        categoria_id: Optional[int],
        disponible: Optional[bool],
        skip: int,
        limit: int,
    ) -> ProductosPaginados:
        with self.uow as uow:
            items, total = uow.productos.search(search, categoria_id, disponible, skip, limit)
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in items]
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo(producto_id)
            if producto is None:
                raise ProductoNoEncontrado()
            return ProductoRead.model_validate(producto)

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = uow.categorias.get_activa(data.categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada()
            producto = Producto(**data.model_dump())
            producto.categoria = categoria
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo(producto_id)
            if producto is None:
                raise ProductoNoEncontrado()

            campos = {
                k: v
                for k, v in data.model_dump(exclude_unset=True).items()
                if not (v is None and k in _NO_NULOS)
            }
            if "categoria_id" in campos:
                categoria = uow.categorias.get_activa(campos["categoria_id"])
                if categoria is None:
                    raise CategoriaNoEncontrada()
                producto.categoria = categoria

            for campo, valor in campos.items():
                setattr(producto, campo, valor)
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo(producto_id)
            if producto is None:
                raise ProductoNoEncontrado()
            if data.stock is not None:
                producto.stock = data.stock
            if data.disponible is not None:
                producto.disponible = data.disponible
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        """Baja lógica (activo = false)."""
        with self.uow as uow:
            producto = uow.productos.get_activo(producto_id)
            if producto is None:
                raise ProductoNoEncontrado()
            producto.activo = False
            uow.productos.add(producto)
