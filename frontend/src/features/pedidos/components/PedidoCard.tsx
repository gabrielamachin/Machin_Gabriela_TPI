import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { formatearFecha } from '@/shared/utils/formatearFecha'
import { formatearPrecio } from '@/shared/utils/formatearPrecio'

import type { Pedido } from '../types'

interface PedidoCardProps {
  pedido: Pedido
  onVerDetalle: (pedidoId: number) => void
  onCancelar: (pedidoId: number) => void
}

export function PedidoCard({ pedido, onVerDetalle, onCancelar }: PedidoCardProps) {
  const unidades = pedido.items.reduce((suma, linea) => suma + linea.cantidad, 0)

  return (
    <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-slate-900">Pedido #{pedido.id}</h2>
          <BadgeEstado estado={pedido.estado} />
        </div>
        <p className="text-sm text-slate-500">
          {formatearFecha(pedido.created_at)} · {unidades} {unidades === 1 ? 'unidad' : 'unidades'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <p className="text-lg font-bold text-slate-900">{formatearPrecio(pedido.total)}</p>
        <Button variante="secondary" tamano="sm" onClick={() => onVerDetalle(pedido.id)}>
          Ver detalle
        </Button>
        {/* Solo se puede cancelar en PENDIENTE (RN-04). */}
        {pedido.estado === 'PENDIENTE' && (
          <Button variante="danger" tamano="sm" onClick={() => onCancelar(pedido.id)}>
            Cancelar
          </Button>
        )}
      </div>
    </Card>
  )
}
