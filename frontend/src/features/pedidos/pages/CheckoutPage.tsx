import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Button } from '@/shared/ui/Button'
import { ButtonLink } from '@/shared/ui/ButtonLink'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Textarea } from '@/shared/ui/Textarea'
import { formatearPrecio } from '@/shared/utils/formatearPrecio'
import { primerError } from '@/shared/utils/primerError'
import { useCartStore } from '@/store/cartStore'

import { useCrearPedido } from '../hooks/useCrearPedido'
import type { FormaPago } from '../types'

function esFormaPago(valor: string): valor is FormaPago {
  return valor === 'EFECTIVO' || valor === 'TRANSFERENCIA'
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((estado) => estado.items)
  const total = useCartStore((estado) => estado.total())
  const vaciar = useCartStore((estado) => estado.vaciar)
  const crearPedido = useCrearPedido()
  const [errorApi, setErrorApi] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
    onSubmit: async ({ value }) => {
      setErrorApi(null)
      try {
        await crearPedido.mutateAsync({
          items: items.map((item) => ({ producto_id: item.producto_id, cantidad: item.cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() || null,
        })
        // Pedido creado: se vacía el carrito y se va a "Mis pedidos".
        navigate('/mis-pedidos')
        vaciar()
      } catch (error) {
        // Por ejemplo, 400 de stock insuficiente: el detalle dice qué producto y cuánto queda.
        setErrorApi(handleApiError(error, 'No se pudo crear el pedido.'))
      }
    },
  })

  // Mientras se navega después de crear el pedido el carrito ya está vacío: no mostrar este aviso.
  if (items.length === 0 && !crearPedido.isSuccess) {
    return (
      <EstadoVacio titulo="No hay nada para confirmar" descripcion="Tu carrito está vacío.">
        <ButtonLink to="/">Ver catálogo</ButtonLink>
      </EstadoVacio>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Confirmar pedido</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card className="p-6">
          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={(evento) => {
              evento.preventDefault()
              evento.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <form.Field
              name="direccion_entrega"
              validators={{
                onChange: ({ value }) => {
                  const texto = value.trim()
                  if (texto.length < 5) return 'La dirección debe tener al menos 5 caracteres'
                  if (texto.length > 200) return 'La dirección admite hasta 200 caracteres'
                  return undefined
                },
              }}
            >
              {(campo) => (
                <Input
                  label="Dirección de entrega"
                  autoComplete="street-address"
                  placeholder="Calle, número, piso y localidad"
                  value={campo.state.value}
                  onBlur={campo.handleBlur}
                  onChange={(evento) => campo.handleChange(evento.target.value)}
                  error={primerError(campo.state.meta.errors)}
                />
              )}
            </form.Field>

            <form.Field name="forma_pago">
              {(campo) => (
                <Select
                  label="Forma de pago"
                  value={campo.state.value}
                  onBlur={campo.handleBlur}
                  onChange={(evento) => {
                    if (esFormaPago(evento.target.value)) campo.handleChange(evento.target.value)
                  }}
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </Select>
              )}
            </form.Field>

            <form.Field
              name="notas"
              validators={{
                onChange: ({ value }) => (value.length > 500 ? 'Las notas admiten hasta 500 caracteres' : undefined),
              }}
            >
              {(campo) => (
                <Textarea
                  label="Notas (opcional)"
                  placeholder="Aclaraciones para el pedido o la entrega"
                  value={campo.state.value}
                  onBlur={campo.handleBlur}
                  onChange={(evento) => campo.handleChange(evento.target.value)}
                  error={primerError(campo.state.meta.errors)}
                />
              )}
            </form.Field>

            {errorApi && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorApi}
              </p>
            )}

            <form.Subscribe selector={(estado) => [estado.canSubmit, estado.isSubmitting] as const}>
              {([puedeEnviar, enviando]) => (
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" cargando={enviando} disabled={!puedeEnviar}>
                    Confirmar pedido
                  </Button>
                  <ButtonLink to="/carrito" variante="secondary">
                    Volver al carrito
                  </ButtonLink>
                </div>
              )}
            </form.Subscribe>
          </form>
        </Card>

        <Card className="h-fit p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Resumen</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {items.map((item) => (
              <li key={item.producto_id} className="flex justify-between gap-3">
                <span className="text-slate-700">
                  {item.cantidad} × {item.nombre}
                </span>
                <span className="font-medium text-slate-900">
                  {formatearPrecio(item.precio_unitario * item.cantidad)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-slate-200 pt-4">
            <span className="font-semibold text-slate-700">Total</span>
            <span className="text-lg font-bold text-slate-900">{formatearPrecio(total)}</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Los precios y el stock se confirman al crear el pedido.
          </p>
        </Card>
      </div>
    </section>
  )
}
