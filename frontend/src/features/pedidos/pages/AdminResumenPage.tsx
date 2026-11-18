import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError } from '@/shared/components/EstadoError'
import { Skeleton } from '@/shared/components/Skeleton'
import { formatearPrecio } from '@/shared/utils/formatearPrecio'

import { TarjetaResumen } from '../components/TarjetaResumen'
import { useResumenPedidos } from '../hooks/useResumenPedidos'

export function AdminResumenPage() {
  const resumen = useResumenPedidos()

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resumen</h1>
        <p className="text-sm text-slate-500">Indicadores generales del negocio.</p>
      </div>

      {resumen.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 6 }, (_, indice) => (
            <Skeleton key={indice} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : resumen.isError ? (
        <EstadoError
          mensaje={handleApiError(resumen.error, 'No se pudo cargar el resumen.')}
          onReintentar={() => void resumen.refetch()}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaResumen
            titulo="Pendientes"
            valor={resumen.data.pendientes}
            descripcion="Esperando que los prepares"
            acento="border-t-amber-400"
          />
          <TarjetaResumen
            titulo="En preparación"
            valor={resumen.data.en_preparacion}
            acento="border-t-blue-400"
          />
          <TarjetaResumen
            titulo="Entregados"
            valor={resumen.data.entregados}
            acento="border-t-green-500"
          />
          <TarjetaResumen
            titulo="Cancelados"
            valor={resumen.data.cancelados}
            acento="border-t-red-400"
          />
          <TarjetaResumen
            titulo="Pedidos de hoy"
            valor={resumen.data.pedidos_hoy}
            descripcion="Día calendario en UTC"
            acento="border-t-orange-500"
          />
          <TarjetaResumen
            titulo="Ingresos"
            valor={formatearPrecio(resumen.data.ingresos_entregados)}
            descripcion="Suma de los pedidos entregados"
            acento="border-t-emerald-600"
          />
        </div>
      )}
    </section>
  )
}
