import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { formatearFecha } from '@/shared/utils/formatearFecha'
import { formatearPrecio } from '@/shared/utils/formatearPrecio'

import { ETIQUETAS_PAGO } from '../constants'
import type { Pedido } from '../types'

/** Detalle completo de un pedido con sus líneas. Lo reutiliza el panel de administración. */
export function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt className="text-slate-500">Estado</dt>
        <dd>
          <BadgeEstado estado={pedido.estado} />
        </dd>
        <dt className="text-slate-500">Fecha</dt>
        <dd>{formatearFecha(pedido.created_at)}</dd>
        <dt className="text-slate-500">Forma de pago</dt>
        <dd>{ETIQUETAS_PAGO[pedido.forma_pago]}</dd>
        <dt className="text-slate-500">Dirección</dt>
        <dd>{pedido.direccion_entrega}</dd>
        {pedido.notas && (
          <>
            <dt className="text-slate-500">Notas</dt>
            <dd>{pedido.notas}</dd>
          </>
        )}
      </dl>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>
              <th className="py-2 pr-2 font-medium">Producto</th>
              <th className="px-2 py-2 text-right font-medium">Cant.</th>
              <th className="px-2 py-2 text-right font-medium">Precio</th>
              <th className="py-2 pl-2 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pedido.items.map((linea) => (
              <tr key={linea.producto_id}>
                <td className="py-2 pr-2">{linea.nombre_producto}</td>
                <td className="px-2 py-2 text-right">{linea.cantidad}</td>
                <td className="px-2 py-2 text-right">{formatearPrecio(linea.precio_unitario)}</td>
                <td className="py-2 pl-2 text-right font-medium">{formatearPrecio(linea.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="flex justify-between border-t border-slate-200 pt-3 text-base">
        <span className="font-semibold text-slate-700">Total</span>
        <span className="font-bold text-slate-900">{formatearPrecio(pedido.total)}</span>
      </p>
    </div>
  )
}
