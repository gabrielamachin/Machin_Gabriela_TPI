import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import { handleApiError } from '@/shared/api/handleApiError'
import { DataTable } from '@/shared/components/DataTable'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Skeleton } from '@/shared/components/Skeleton'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'

import { CategoriaForm } from '../components/CategoriaForm'
import { useCategorias, useEliminarCategoria } from '../hooks/useCategorias'
import type { Categoria } from '../types'

export function AdminCategoriasPage() {
  const categorias = useCategorias()
  const eliminar = useEliminarCategoria()

  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [eliminando, setEliminando] = useState<Categoria | null>(null)
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null)

  const abrirAlta = () => {
    setEditando(null)
    setFormularioAbierto(true)
  }

  const columnas = useMemo<ColumnDef<Categoria>[]>(
    () => [
      { accessorKey: 'nombre', header: 'Nombre' },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        cell: ({ row }) => row.original.descripcion ?? '—',
      },
      {
        id: 'acciones',
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
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
      onError: (error) => setErrorEliminar(handleApiError(error, 'No se pudo eliminar la categoría.')),
    })
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categorías</h1>
          <p className="text-sm text-slate-500">Organizan los productos del catálogo.</p>
        </div>
        <Button onClick={abrirAlta}>Nueva categoría</Button>
      </div>

      {categorias.isLoading ? (
        <div className="flex flex-col gap-2" aria-hidden="true">
          {Array.from({ length: 4 }, (_, indice) => (
            <Skeleton key={indice} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : categorias.isError ? (
        <EstadoError
          mensaje={handleApiError(categorias.error, 'No se pudieron cargar las categorías.')}
          onReintentar={() => void categorias.refetch()}
        />
      ) : !categorias.data ? null : categorias.data.length === 0 ? (
        <EstadoVacio titulo="Todavía no hay categorías" descripcion="Creá la primera para empezar a cargar productos.">
          <Button onClick={abrirAlta}>Nueva categoría</Button>
        </EstadoVacio>
      ) : (
        <DataTable datos={categorias.data} columnas={columnas} />
      )}

      <Modal
        abierto={formularioAbierto}
        onCerrar={() => setFormularioAbierto(false)}
        titulo={editando ? 'Editar categoría' : 'Nueva categoría'}
      >
        {/* La key reinicia el formulario al pasar de una categoría a otra. */}
        <CategoriaForm
          key={editando?.id ?? 'nueva'}
          categoria={editando}
          onTerminar={() => setFormularioAbierto(false)}
        />
      </Modal>

      <Modal
        abierto={eliminando !== null}
        onCerrar={() => setEliminando(null)}
        titulo="Eliminar categoría"
      >
        <p className="text-sm text-slate-600">
          ¿Eliminar la categoría <strong>{eliminando?.nombre}</strong>? Deja de mostrarse en el catálogo.
          Sus productos no se eliminan: si querés retirarlos también, dalos de baja desde Productos.
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
