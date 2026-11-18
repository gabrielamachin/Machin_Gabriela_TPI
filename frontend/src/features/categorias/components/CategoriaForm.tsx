import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { primerError } from '@/shared/utils/primerError'

import { useActualizarCategoria, useCrearCategoria } from '../hooks/useCategorias'
import type { Categoria } from '../types'

interface CategoriaFormProps {
  /** Categoría a editar; null para crear una nueva. */
  categoria: Categoria | null
  onTerminar: () => void
}

export function CategoriaForm({ categoria, onTerminar }: CategoriaFormProps) {
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const [errorApi, setErrorApi] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
    },
    onSubmit: async ({ value }) => {
      setErrorApi(null)
      const datos = { nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }
      try {
        if (categoria) {
          await actualizar.mutateAsync({ id: categoria.id, datos })
        } else {
          await crear.mutateAsync(datos)
        }
        onTerminar()
      } catch (error) {
        setErrorApi(handleApiError(error)) // por ejemplo, 409: ya existe una categoría con ese nombre
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
            if (texto.length < 2) return 'El nombre debe tener al menos 2 caracteres'
            if (texto.length > 100) return 'El nombre admite hasta 100 caracteres'
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
              {categoria ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  )
}
