import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { useState } from 'react'

import { Paginacion } from '@/shared/components/Paginacion'

interface DataTableProps<T> {
  datos: T[]
  columnas: ColumnDef<T>[]
  /** Filas por página (la paginación es del lado del cliente). */
  tamanoPagina?: number
}

/** Tabla del panel de administración con TanStack Table: ordenable y paginada en el cliente. */
export function DataTable<T>({ datos, columnas, tamanoPagina = 10 }: DataTableProps<T>) {
  const [orden, setOrden] = useState<SortingState>([])

  const tabla = useReactTable({
    data: datos,
    columns: columnas,
    state: { sorting: orden },
    onSortingChange: setOrden,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: tamanoPagina } },
  })

  const { pageIndex, pageSize } = tabla.getState().pagination

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            {tabla.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((encabezado) => {
                  const ordenable = encabezado.column.getCanSort()
                  const sentido = encabezado.column.getIsSorted()
                  const contenido = flexRender(encabezado.column.columnDef.header, encabezado.getContext())
                  return (
                    <th
                      key={encabezado.id}
                      scope="col"
                      aria-sort={sentido === 'asc' ? 'ascending' : sentido === 'desc' ? 'descending' : undefined}
                      className="px-4 py-3 font-medium"
                    >
                      {encabezado.isPlaceholder ? null : ordenable ? (
                        <button
                          type="button"
                          onClick={encabezado.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 uppercase hover:text-slate-800"
                        >
                          {contenido}
                          <span aria-hidden="true">{sentido === 'asc' ? '▲' : sentido === 'desc' ? '▼' : ''}</span>
                        </button>
                      ) : (
                        contenido
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tabla.getRowModel().rows.map((fila) => (
              <tr key={fila.id} className="hover:bg-slate-50">
                {fila.getVisibleCells().map((celda) => (
                  <td key={celda.id} className="px-4 py-3 align-middle">
                    {flexRender(celda.column.columnDef.cell, celda.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Paginacion
        pagina={pageIndex}
        limite={pageSize}
        total={datos.length}
        onCambiar={(pagina) => tabla.setPageIndex(pagina)}
      />
    </div>
  )
}
