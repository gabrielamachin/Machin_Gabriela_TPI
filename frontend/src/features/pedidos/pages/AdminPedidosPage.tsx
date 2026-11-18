import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import { handleApiError } from '@/shared/api/handleApiError'
import { DataTable } from '@/shared/components/DataTable'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Skeleton } from '@/shared/components/Skeleton'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { Select } from '@/shared/ui/Select'
import { formatearFecha } from '@/shared/utils/formatearFecha'
import { formatearPrecio } from '@/shared/utils/formatearPrecio'

import { PedidoDetalle } from '../components/PedidoDetalle'
import {
  ESTADOS_PEDIDO,
  ETIQUETAS_ACCION,
  ETIQUETAS_ESTADO,
  ETIQUETAS_PAGO,
  puedeCancelar,
  siguienteEstado,
} from '../constants'
import { useCambiarEstadoPedido } from '../hooks/useCambiarEstadoPedido'
import { usePedidos } from '../hooks/usePedidos'
import type { EstadoPedido, FiltrosPedidos, Pedido } from '../types'

const LIMITE = 10

interface CambioPendiente {
  pedidoId: number
  estado: EstadoPedido
}

export function AdminPedidosPage() {
  const [filtros, setFiltros] = useState<FiltrosPedidos>({ pagina: 0, limite: LIMITE })
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [cambio, setCambio] = useState<CambioPendiente | null>(null)
  const [errorCambio, setErrorCambio] = useState<string | null>(null)

  const pedidos = usePedidos(filtros) // el backend devuelve todos los pedidos para el admin
  const cambiarEstado = useCambiarEstadoPedido()

  const pedidoDetalle = pedidos.data?.items.find((pedido) => pedido.id === detalleId)

  const pedirCambio = (pedidoId: number, estado: EstadoPedido) => {
    setErrorCambio(null)
    setCambio({ pedidoId, estado })
  }

  const columnas = useMemo<ColumnDef<Pedido>[]>(
    () => [
      {
        accessorKey: 'id',
        header: '#',
        cell: ({ row }) => <span className="font-semibold">#{row.original.id}</span>,
      },
      {
        accessorKey: 'usuario_id',
        header: 'Cliente',
        cell: ({ row }) => `Usuario #${row.original.usuario_id}`,
      },
      {
        accessorKey: 'created_at',
        header: 'Fecha',
        cell: ({ row }) => formatearFecha(row.original.created_at),
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => <BadgeEstado estado={row.original.estado} />,
      },
      {
        accessorKey: 'forma_pago',
        header: 'Pago',
        cell: ({ row }) => ETIQUETAS_PAGO[row.original.forma_pago],
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => <span className="font-semibold">{formatearPrecio(row.original.total)}</span>,
      },
      {
        id: 'acciones',
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => {
          const pedido = row.original
          const siguiente = siguienteEstado(pedido.estado)
          return (
            <div className="flex flex-wrap justify-end gap-2">
              <Button variante="secondary" tamano="sm" onClick={() => setDetalleId(pedido.id)}>
                Detalle
              </Button>
              {siguiente && (
                <Button tamano="sm" onClick={() => pedirCambio(pedido.id, siguiente)}>
                  {ETIQUETAS_ACCION[siguiente]}
                </Button>
              )}
              {puedeCancelar(pedido.estado) && (
                <Button variante="danger" tamano="sm" onClick={() => pedirCambio(pedido.id, 'CANCELADO')}>
                  Cancelar
                </Button>
              )}
            </div>
          )
        },
      },
    ],
    [],
  )

  const cambiarFiltroEstado = (valor: string) => {
    setFiltros((previos) => ({
      ...previos,
      estado: ESTADOS_PEDIDO.find((estado) => estado === valor),
      pagina: 0,
    }))
  }

  const confirmarCambio = () => {
    if (!cambio) return
    cambiarEstado.mutate(cambio, {
      onSuccess: () => setCambio(null),
      // Por ejemplo, 400: el pedido ya cambió de estado y la transición dejó de ser válida.
      onError: (error) => setErrorCambio(handleApiError(error, 'No se pudo cambiar el estado.')),
    })
  }

  const cancelando = cambio?.estado === 'CANCELADO'

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pedidos</h1>
          <p className="text-sm text-slate-500">Hacé avanzar los pedidos o cancelalos.</p>
        </div>
        <div className="w-52">
          <Select
            label="Estado"
            value={filtros.estado ?? ''}
            onChange={(evento) => cambiarFiltroEstado(evento.target.value)}
          >
            <option value="">Todos</option>
            {ESTADOS_PEDIDO.map((estado) => (
              <option key={estado} value={estado}>
                {ETIQUETAS_ESTADO[estado]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {pedidos.isLoading ? (
        <div className="flex flex-col gap-2" aria-hidden="true">
          {Array.from({ length: 5 }, (_, indice) => (
            <Skeleton key={indice} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : pedidos.isError ? (
        <EstadoError
          mensaje={handleApiError(pedidos.error, 'No se pudieron cargar los pedidos.')}
          onReintentar={() => void pedidos.refetch()}
        />
      ) : !pedidos.data ? null : pedidos.data.items.length === 0 ? (
        <EstadoVacio
          titulo={filtros.estado ? 'No hay pedidos en ese estado' : 'Todavía no hay pedidos'}
          descripcion={filtros.estado ? undefined : 'Cuando los clientes confirmen pedidos, aparecen acá.'}
        />
      ) : (
        <DataTable
          datos={pedidos.data.items}
          columnas={columnas}
          paginacionServidor={{
            pagina: filtros.pagina,
            limite: filtros.limite,
            total: pedidos.data.total,
            onCambiar: (pagina) => setFiltros((previos) => ({ ...previos, pagina })),
          }}
        />
      )}

      <Modal
        abierto={detalleId !== null && pedidoDetalle !== undefined}
        onCerrar={() => setDetalleId(null)}
        titulo={`Pedido #${detalleId ?? ''}`}
      >
        {pedidoDetalle && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-500">Cliente: usuario #{pedidoDetalle.usuario_id}</p>
            <PedidoDetalle pedido={pedidoDetalle} />
          </div>
        )}
      </Modal>

      <Modal
        abierto={cambio !== null}
        onCerrar={() => setCambio(null)}
        titulo={cancelando ? `Cancelar pedido #${cambio?.pedidoId}` : `Pedido #${cambio?.pedidoId ?? ''}`}
      >
        <p className="text-sm text-slate-600">
          {cancelando
            ? 'Se cancela el pedido y el stock de sus productos vuelve a estar disponible. No se puede deshacer.'
            : `El pedido pasa a «${cambio ? ETIQUETAS_ESTADO[cambio.estado] : ''}». No se puede volver atrás.`}
        </p>
        {errorCambio && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorCambio}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <Button variante="secondary" onClick={() => setCambio(null)}>
            Volver
          </Button>
          <Button
            variante={cancelando ? 'danger' : 'primary'}
            cargando={cambiarEstado.isPending}
            onClick={confirmarCambio}
          >
            {cancelando ? 'Cancelar pedido' : 'Confirmar'}
          </Button>
        </div>
      </Modal>
    </section>
  )
}
