from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .models import Categoria
from .unit_of_work import CategoriaUnitOfWork


# --- Excepciones de dominio: el Router las traduce a HTTP ---
class CategoriaNoEncontrada(Exception):
    def __init__(self) -> None:
        super().__init__("Categoría no encontrada")


class NombreDuplicado(Exception):
    def __init__(self) -> None:
        super().__init__("Ya existe una categoría con ese nombre")


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_activa(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada()
            return CategoriaRead.model_validate(categoria)

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            # get_by_nombre NO filtra por activo: la baja lógica no libera el nombre.
            if uow.categorias.get_by_nombre(data.nombre) is not None:
                raise NombreDuplicado()
            categoria = Categoria(nombre=data.nombre, descripcion=data.descripcion)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_activa(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada()

            campos = data.model_dump(exclude_unset=True)
            if campos.get("nombre") is None:
                campos.pop("nombre", None)  # el nombre es obligatorio: null = no cambiar
            else:
                otra = uow.categorias.get_by_nombre(campos["nombre"])
                if otra is not None and otra.id != categoria.id:
                    raise NombreDuplicado()

            for campo, valor in campos.items():
                setattr(categoria, campo, valor)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        """Baja lógica. No toca los productos: para retirar la categoría del
        catálogo se dan de baja también sus productos."""
        with self.uow as uow:
            categoria = uow.categorias.get_activa(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada()
            categoria.activo = False
            uow.categorias.add(categoria)
