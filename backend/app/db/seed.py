"""Carga datos iniciales: admin, categorías y productos.

Uso (desde backend/):  python -m app.db.seed

Es idempotente: se puede ejecutar varias veces sin duplicar datos.
"""
from sqlmodel import select

from app.core.database import create_all_tables
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.productos.models import Producto
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import ROLE_ADMIN, Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Admin1234!"
ADMIN_EMAIL = "admin@foodstore.com"

CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas artesanales con papas"),
    ("Pizzas", "Pizzas al horno de piedra"),
    ("Bebidas", "Gaseosas, jugos y agua"),
    ("Postres", "Dulces para cerrar la comida"),
]

# (categoría, nombre, descripción, precio_base, stock)
PRODUCTOS = [
    ("Hamburguesas", "Hamburguesa Clásica", "Carne, lechuga, tomate y cheddar", 7500.0, 25),
    ("Hamburguesas", "Hamburguesa Doble", "Doble carne, doble cheddar y panceta", 9800.0, 20),
    ("Hamburguesas", "Hamburguesa Veggie", "Medallón de lentejas y vegetales grillados", 7200.0, 15),
    ("Pizzas", "Pizza Muzzarella", "Salsa de tomate y muzzarella", 8500.0, 30),
    ("Pizzas", "Pizza Napolitana", "Muzzarella, rodajas de tomate y ajo", 9300.0, 20),
    ("Bebidas", "Gaseosa Cola 500 ml", "Botella individual bien fría", 1800.0, 60),
    ("Bebidas", "Agua Mineral 500 ml", "Sin gas", 1200.0, 80),
    ("Postres", "Flan con Dulce de Leche", "Casero, con crema", 3200.0, 18),
    ("Postres", "Brownie con Helado", "Brownie tibio y bocha de vainilla", 4500.0, 12),
]


def _imagen(nombre: str) -> str:
    return "https://placehold.co/600x400?text=" + nombre.replace(" ", "+")


def seed_admin() -> bool:
    with UsuarioUnitOfWork() as uow:
        if uow.usuarios.get_by_username(ADMIN_USERNAME) is not None:
            return False
        uow.usuarios.add(
            Usuario(
                username=ADMIN_USERNAME,
                full_name="Administrador",
                email=ADMIN_EMAIL,
                hashed_password=hash_password(ADMIN_PASSWORD),
                role=ROLE_ADMIN,
            )
        )
        return True


def seed_categorias() -> int:
    creadas = 0
    with CategoriaUnitOfWork() as uow:
        for nombre, descripcion in CATEGORIAS:
            if uow.categorias.get_by_nombre(nombre) is None:
                uow.categorias.add(Categoria(nombre=nombre, descripcion=descripcion))
                creadas += 1
    return creadas


def seed_productos() -> int:
    creados = 0
    with ProductoUnitOfWork() as uow:
        for cat_nombre, nombre, descripcion, precio, stock in PRODUCTOS:
            existente = uow.session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if existente is not None:
                continue
            categoria = uow.categorias.get_by_nombre(cat_nombre)
            if categoria is None:
                continue
            uow.productos.add(
                Producto(
                    categoria_id=categoria.id,  # type: ignore[arg-type]
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_base=precio,
                    imagen_url=_imagen(nombre),
                    stock=stock,
                )
            )
            creados += 1
    return creados


def main() -> None:
    create_all_tables()
    admin = seed_admin()
    categorias = seed_categorias()
    productos = seed_productos()
    print("Seed completado:")
    print(f"  admin:      {'creado' if admin else 'ya existía'} ({ADMIN_USERNAME} / {ADMIN_PASSWORD})")
    print(f"  categorías: {categorias} nuevas")
    print(f"  productos:  {productos} nuevos")


if __name__ == "__main__":
    main()
