import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Input } from '@/shared/ui/Input'
import { primerError } from '@/shared/utils/primerError'

import { useActualizarStock } from '../hooks/useProductos'
import type { Producto } from '../types'
import { validarStock } from '../utils/validaciones'

interface StockFormProps {
  producto: Producto
  onTerminar: () => void
}

/** Cambio de stock y disponibilidad de un producto (PATCH /productos/{id}/stock). */
export function StockForm({ producto, onTerminar }: StockFormProps) {
  const actualizarStock = useActualizarStock()
  const [errorApi, setErrorApi] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      setErrorApi(null)
      try {
        await actualizarStock.mutateAsync({
          id: producto.id,
          datos: { stock: Number(value.stock), disponible: value.disponible },
        })
        onTerminar()
      } catch (error) {
        setErrorApi(handleApiError(error))
      }
    },
  })

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(evento) => {
        evento.preventDefault()
        evento.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <p className="text-sm text-slate-600">
        <strong>{producto.nombre}</strong>
      </p>

      <form.Field name="stock" validators={{ onChange: ({ value }) => validarStock(value) }}>
        {(campo) => (
          <Input
            label="Stock"
            type="number"
            step="1"
            min="0"
            value={campo.state.value}
            onBlur={campo.handleBlur}
            onChange={(evento) => campo.handleChange(evento.target.value)}
            error={primerError(campo.state.meta.errors)}
          />
        )}
      </form.Field>

      <form.Field name="disponible">
        {(campo) => (
          <Checkbox
            label="Disponible para la venta"
            checked={campo.state.value}
            onChange={(evento) => campo.handleChange(evento.target.checked)}
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
          <div className="flex justify-end gap-3">
            <Button variante="secondary" onClick={onTerminar}>
              Cancelar
            </Button>
            <Button type="submit" cargando={enviando} disabled={!puedeEnviar}>
              Guardar
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  )
}
