import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import { handleApiError } from '@/shared/api/handleApiError'
import { DataTable } from '@/shared/components/DataTable'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Skeleton } from '@/shared/components/Skeleton'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { formatearPrecio } from '@/shared/utils/formatearPrecio'

import { ProductoForm } from '../components/ProductoForm'
import { StockForm } from '../components/StockForm'
import { useEliminarProducto, useProductos } from '../hooks/useProductos'
import type { FiltrosProductos, Producto } from '../types'

// El panel pide hasta 100 productos (máximo del backend) y pagina en el cliente.
const FILTROS_PANEL: FiltrosProductos = { pagina: 0, limite: 100 }

export function AdminProductosPage() {
  const productos = useProductos(FILTROS_PANEL)
  const eliminar = useEliminarProducto()

  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [editando, setEditando] = useState<Producto | null>(null)
  const [stockDe, setStockDe] = useState<Producto | null>(null)
  const [eliminando, setEliminando] = useState<Producto | null>(null)
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null)

  const abrirAlta = () => {
    setEditando(null)
    setFormularioAbierto(true)
  }

  const columnas = useMemo<ColumnDef<Producto>[]>(
    () => [
      {
        id: 'imagen',
        header: () => <span className="sr-only">Imagen</span>,
        cell: ({ row }) =>
          row.original.imagen_url ? (
            <img src={row.original.imagen_url} alt="" loading="lazy" className="h-10 w-10 rounded object-cover" />
          ) : (
            <div className="h-10 w-10 rounded bg-slate-100" aria-hidden="true" />
          ),
      },
      { accessorKey: 'nombre', header: 'Nombre' },
      {
        id: 'categoria',
        header: 'Categoría',
        accessorFn: (producto) => producto.categoria?.nombre ?? '—',
      },
      {
        accessorKey: 'precio_base',
        header: 'Precio',
        cell: ({ row }) => formatearPrecio(row.original.precio_base),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => (
          <span className={row.original.stock === 0 ? 'font-semibold text-red-600' : undefined}>
            {row.original.stock}
          </span>
        ),
      },
      {
        accessorKey: 'disponible',
        header: 'Disponible',
        cell: ({ row }) =>
          row.original.disponible ? (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">Sí</span>
          ) : (
            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">No</span>
          ),
      },
      {
        id: 'acciones',
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button variante="secondary" tamano="sm" onClick={() => setStockDe(row.original)}>
              Stock
            </Button>
            <Button
              variante="secondary"
              tamano="sm"
              onClick={() => {
                setEditando(row.original)
                setFormularioAbierto(true)
              }}
            >
              Editar
            </Button>
            <Button
              variante="danger"
              tamano="sm"
              onClick={() => {
                setErrorEliminar(null)
                setEliminando(row.original)
              }}
            >
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  const confirmarEliminacion = () => {
    if (!eliminando) return
    eliminar.mutate(eliminando.id, {
      onSuccess: () => setEliminando(null),
      onError: (error) => setErrorEliminar(handleApiError(error, 'No se pudo eliminar el producto.')),
    })
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
          <p className="text-sm text-slate-500">Catálogo, precios y stock.</p>
        </div>
        <Button onClick={abrirAlta}>Nuevo producto</Button>
      </div>

      {productos.isPending ? (
        <div className="flex flex-col gap-2" aria-hidden="true">
          {Array.from({ length: 5 }, (_, indice) => (
            <Skeleton key={indice} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : productos.isError ? (
        <EstadoError
          mensaje={handleApiError(productos.error, 'No se pudieron cargar los productos.')}
          onReintentar={() => void productos.refetch()}
        />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio titulo="Todavía no hay productos" descripcion="Cargá el primero para armar el catálogo.">
          <Button onClick={abrirAlta}>Nuevo producto</Button>
        </EstadoVacio>
      ) : (
        <DataTable datos={productos.data.items} columnas={columnas} />
      )}

      <Modal
        abierto={formularioAbierto}
        onCerrar={() => setFormularioAbierto(false)}
        titulo={editando ? 'Editar producto' : 'Nuevo producto'}
      >
        {/* La key reinicia el formulario al pasar de un producto a otro. */}
        <ProductoForm
          key={editando?.id ?? 'nuevo'}
          producto={editando}
          onTerminar={() => setFormularioAbierto(false)}
        />
      </Modal>

      <Modal abierto={stockDe !== null} onCerrar={() => setStockDe(null)} titulo="Stock y disponibilidad">
        {stockDe && <StockForm key={stockDe.id} producto={stockDe} onTerminar={() => setStockDe(null)} />}
      </Modal>

      <Modal abierto={eliminando !== null} onCerrar={() => setEliminando(null)} titulo="Eliminar producto">
        <p className="text-sm text-slate-600">
          ¿Eliminar <strong>{eliminando?.nombre}</strong>? Deja de mostrarse en el catálogo. Los pedidos que
          ya lo incluyen conservan su nombre y precio.
        </p>
        {errorEliminar && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorEliminar}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <Button variante="secondary" onClick={() => setEliminando(null)}>
            Cancelar
          </Button>
          <Button variante="danger" cargando={eliminar.isPending} onClick={confirmarEliminacion}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </section>
  )
}
