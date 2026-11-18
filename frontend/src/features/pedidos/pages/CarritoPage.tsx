import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { Card } from '@/shared/ui/Card'
import { formatearPrecio } from '@/shared/utils/formatearPrecio'
import { useCartStore } from '@/store/cartStore'

export function CarritoPage() {
  const items = useCartStore((estado) => estado.items)
  const total = useCartStore((estado) => estado.total())
  const cambiarCantidad = useCartStore((estado) => estado.cambiarCantidad)
  const quitar = useCartStore((estado) => estado.quitar)
  const vaciar = useCartStore((estado) => estado.vaciar)

  if (items.length === 0) {
    return (
      <EstadoVacio titulo="Tu carrito está vacío" descripcion="Agregá productos desde el catálogo para armar tu pedido.">
        <ButtonLink to="/">Ver catálogo</ButtonLink>
      </EstadoVacio>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-slate-900">Carrito</h1>
        <Button variante="ghost" tamano="sm" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <Card className="divide-y divide-slate-200">
        {items.map((item) => (
          <div key={item.producto_id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-48 flex-1">
              <p className="font-semibold text-slate-900">{item.nombre}</p>
              <p className="text-sm text-slate-500">{formatearPrecio(item.precio_unitario)} c/u</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variante="secondary"
                tamano="sm"
                aria-label={`Quitar una unidad de ${item.nombre}`}
                disabled={item.cantidad <= 1}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
              >
                −
              </Button>
              <span className="w-8 text-center font-medium" aria-live="polite">
                {item.cantidad}
              </span>
              <Button
                variante="secondary"
                tamano="sm"
                aria-label={`Agregar una unidad de ${item.nombre}`}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
              >
                +
              </Button>
            </div>

            <p className="w-28 text-right font-semibold text-slate-900">
              {formatearPrecio(item.precio_unitario * item.cantidad)}
            </p>
            <Button variante="ghost" tamano="sm" onClick={() => quitar(item.producto_id)}>
              Quitar
            </Button>
          </div>
        ))}
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
        <p className="text-lg text-slate-700">
          Total: <span className="text-2xl font-bold text-slate-900">{formatearPrecio(total)}</span>
        </p>
        <div className="flex gap-3">
          <ButtonLink to="/" variante="secondary">
            Seguir comprando
          </ButtonLink>
          <ButtonLink to="/checkout">Confirmar pedido</ButtonLink>
        </div>
      </Card>
    </section>
  )
}
