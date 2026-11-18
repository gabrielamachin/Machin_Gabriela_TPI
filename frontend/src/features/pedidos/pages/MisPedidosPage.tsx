import { useState } from 'react'

import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Paginacion } from '@/shared/components/Paginacion'
import { Skeleton } from '@/shared/components/Skeleton'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { Modal } from '@/shared/ui/Modal'
import { Select } from '@/shared/ui/Select'

import { PedidoCard } from '../components/PedidoCard'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { ESTADOS_PEDIDO, ETIQUETAS_ESTADO } from '../constants'
import { useCancelarPedido } from '../hooks/useCancelarPedido'
import { useMisPedidos } from '../hooks/usePedidos'
import type { FiltrosPedidos } from '../types'

const LIMITE = 10

export function MisPedidosPage() {
  const [filtros, setFiltros] = useState<FiltrosPedidos>({ pagina: 0, limite: LIMITE })
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [cancelarId, setCancelarId] = useState<number | null>(null)
  const [errorCancelar, setErrorCancelar] = useState<string | null>(null)

  const pedidos = useMisPedidos(filtros)
  const cancelar = useCancelarPedido()

  // Se busca en los datos vigentes (y no se guarda el objeto): así el detalle nunca queda desactualizado.
  const pedidoDetalle = pedidos.data?.items.find((pedido) => pedido.id === detalleId)

  const cambiarEstado = (valor: string) => {
    setFiltros((previos) => ({
      ...previos,
      estado: ESTADOS_PEDIDO.find((estado) => estado === valor),
      pagina: 0,
    }))
  }

  const pedirCancelacion = (pedidoId: number) => {
    setErrorCancelar(null)
    setCancelarId(pedidoId)
  }

  const confirmarCancelacion = () => {
    if (cancelarId === null) return
    cancelar.mutate(cancelarId, {
      onSuccess: () => setCancelarId(null),
      // Por ejemplo: el administrador ya lo pasó a EN_PREPARACION y no se puede cancelar.
      onError: (error) => setErrorCancelar(handleApiError(error, 'No se pudo cancelar el pedido.')),
    })
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis pedidos</h1>
          <p className="text-sm text-slate-500">Podés cancelar un pedido mientras esté pendiente.</p>
        </div>
        <div className="w-52">
          <Select
            label="Estado"
            value={filtros.estado ?? ''}
            onChange={(evento) => cambiarEstado(evento.target.value)}
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
        <div className="flex flex-col gap-3" aria-hidden="true">
          {Array.from({ length: 3 }, (_, indice) => (
            <Skeleton key={indice} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : pedidos.isError ? (
        <EstadoError
          mensaje={handleApiError(pedidos.error, 'No se pudieron cargar tus pedidos.')}
          onReintentar={() => void pedidos.refetch()}
        />
      ) : !pedidos.data ? null : pedidos.data.items.length === 0 ? (
        <EstadoVacio
          titulo={filtros.estado ? 'No tenés pedidos en ese estado' : 'Todavía no hiciste pedidos'}
          descripcion={filtros.estado ? undefined : 'Cuando confirmes un pedido, lo vas a ver acá.'}
        >
          {!filtros.estado && <ButtonLink to="/">Ver catálogo</ButtonLink>}
        </EstadoVacio>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {pedidos.data.items.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                onVerDetalle={setDetalleId}
                onCancelar={pedirCancelacion}
              />
            ))}
          </div>
          <Paginacion
            pagina={filtros.pagina}
            limite={filtros.limite}
            total={pedidos.data.total}
            onCambiar={(pagina) => setFiltros((previos) => ({ ...previos, pagina }))}
          />
        </>
      )}

      <Modal
        abierto={detalleId !== null && pedidoDetalle !== undefined}
        onCerrar={() => setDetalleId(null)}
        titulo={`Pedido #${detalleId ?? ''}`}
      >
        {pedidoDetalle && <PedidoDetalle pedido={pedidoDetalle} />}
      </Modal>

      <Modal
        abierto={cancelarId !== null}
        onCerrar={() => setCancelarId(null)}
        titulo={`Cancelar pedido #${cancelarId ?? ''}`}
      >
        <p className="text-sm text-slate-600">
          ¿Seguro que querés cancelar este pedido? No se puede deshacer, y los productos vuelven a
          estar disponibles.
        </p>
        {errorCancelar && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorCancelar}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <Button variante="secondary" onClick={() => setCancelarId(null)}>
            Volver
          </Button>
          <Button variante="danger" cargando={cancelar.isPending} onClick={confirmarCancelacion}>
            Cancelar pedido
          </Button>
        </div>
      </Modal>
    </section>
  )
}
