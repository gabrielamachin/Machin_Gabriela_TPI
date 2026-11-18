import { formatearPrecio } from '@/shared/utils/formatearPrecio'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { useCartStore } from '@/store/cartStore'

import type { Producto } from '../types'

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((estado) => estado.agregar)
  const enCarrito = useCartStore(
    (estado) => estado.items.find((item) => item.producto_id === producto.id)?.cantidad ?? 0,
  )

  const sinStock = producto.stock <= 0
  const noDisponible = !producto.disponible
  const llegoAlMaximo = !sinStock && enCarrito >= producto.stock
  const deshabilitado = noDisponible || sinStock || llegoAlMaximo

  let textoBoton = 'Agregar al carrito'
  if (noDisponible) textoBoton = 'No disponible'
  else if (sinStock) textoBoton = 'Sin stock'
  else if (llegoAlMaximo) textoBoton = 'Máximo en el carrito'

  return (
    <Card className="flex flex-col overflow-hidden">
      {producto.imagen_url ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          loading="lazy"
          className="aspect-3/2 w-full object-cover"
        />
      ) : (
        <div className="grid aspect-3/2 w-full place-items-center bg-slate-100 text-sm text-slate-400">
          Sin imagen
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        {producto.categoria && (
          <span className="w-fit rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
            {producto.categoria.nombre}
          </span>
        )}
        <h3 className="text-base font-semibold text-slate-900">{producto.nombre}</h3>
        {producto.descripcion && (
          <p className="line-clamp-2 text-sm text-slate-500">{producto.descripcion}</p>
        )}

        <div className="mt-auto flex items-end justify-between pt-2">
          <p className="text-lg font-bold text-slate-900">{formatearPrecio(producto.precio_base)}</p>
          {!noDisponible && !sinStock && producto.stock <= 5 && (
            <span className="text-xs font-medium text-amber-700">Últimas {producto.stock} unidades</span>
          )}
        </div>

        <Button onClick={() => agregar(producto)} disabled={deshabilitado}>
          {textoBoton}
        </Button>
        {enCarrito > 0 && (
          <p className="text-center text-xs text-slate-500">En tu carrito: {enCarrito}</p>
        )}
      </div>
    </Card>
  )
}
