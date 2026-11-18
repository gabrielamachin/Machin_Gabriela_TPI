import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Textarea } from '@/shared/ui/Textarea'
import { primerError } from '@/shared/utils/primerError'

import { useActualizarProducto, useCrearProducto } from '../hooks/useProductos'
import type { Producto } from '../types'
import { aNumero, validarPrecio, validarStock, validarUrlImagen } from '../utils/validaciones'

interface ProductoFormProps {
  /** Producto a editar; null para crear uno nuevo. */
  producto: Producto | null
  onTerminar: () => void
}

export function ProductoForm({ producto, onTerminar }: ProductoFormProps) {
  const categorias = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const [errorApi, setErrorApi] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      categoria_id: producto ? String(producto.categoria_id) : '',
      precio_base: producto ? String(producto.precio_base) : '',
      imagen_url: producto?.imagen_url ?? '',
      descripcion: producto?.descripcion ?? '',
      stock: '0', // solo se usa al crear
      disponible: true, // solo se usa al crear
    },
    onSubmit: async ({ value }) => {
      setErrorApi(null)
      const datos = {
        nombre: value.nombre.trim(),
        categoria_id: Number(value.categoria_id),
        precio_base: aNumero(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        descripcion: value.descripcion.trim() || null,
      }
      try {
        if (producto) {
          await actualizar.mutateAsync({ id: producto.id, datos })
        } else {
          await crear.mutateAsync({ ...datos, stock: Number(value.stock), disponible: value.disponible })
        }
        onTerminar()
      } catch (error) {
        setErrorApi(handleApiError(error)) // por ejemplo, 404: la categoría ya no existe
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
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const texto = value.trim()
            if (!texto) return 'Ingresá el nombre'
            if (texto.length > 150) return 'El nombre admite hasta 150 caracteres'
            return undefined
          },
        }}
      >
        {(campo) => (
          <Input
            label="Nombre"
            value={campo.state.value}
            onBlur={campo.handleBlur}
            onChange={(evento) => campo.handleChange(evento.target.value)}
            error={primerError(campo.state.meta.errors)}
          />
        )}
      </form.Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field
          name="categoria_id"
          validators={{ onChange: ({ value }) => (value ? undefined : 'Elegí una categoría') }}
        >
          {(campo) => (
            <Select
              label="Categoría"
              value={campo.state.value}
              onBlur={campo.handleBlur}
              onChange={(evento) => campo.handleChange(evento.target.value)}
              disabled={categorias.isPending}
              error={primerError(campo.state.meta.errors)}
            >
              <option value="">Elegí una categoría</option>
              {categorias.data?.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </Select>
          )}
        </form.Field>

        <form.Field name="precio_base" validators={{ onChange: ({ value }) => validarPrecio(value) }}>
          {(campo) => (
            <Input
              label="Precio"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={campo.state.value}
              onBlur={campo.handleBlur}
              onChange={(evento) => campo.handleChange(evento.target.value)}
              error={primerError(campo.state.meta.errors)}
            />
          )}
        </form.Field>
      </div>

      <form.Field name="imagen_url" validators={{ onChange: ({ value }) => validarUrlImagen(value) }}>
        {(campo) => (
          <Input
            label="URL de la imagen (opcional)"
            type="url"
            placeholder="https://…"
            value={campo.state.value}
            onBlur={campo.handleBlur}
            onChange={(evento) => campo.handleChange(evento.target.value)}
            error={primerError(campo.state.meta.errors)}
          />
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(campo) => (
          <Textarea
            label="Descripción (opcional)"
            value={campo.state.value}
            onBlur={campo.handleBlur}
            onChange={(evento) => campo.handleChange(evento.target.value)}
          />
        )}
      </form.Field>

      {producto ? (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          El stock y la disponibilidad se cambian con el botón «Stock» de la tabla.
        </p>
      ) : (
        <div className="grid items-end gap-4 sm:grid-cols-2">
          <form.Field name="stock" validators={{ onChange: ({ value }) => validarStock(value) }}>
            {(campo) => (
              <Input
                label="Stock inicial"
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
        </div>
      )}

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
              {producto ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  )
}
