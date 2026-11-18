import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'

import { register } from '@/features/auth/api/auth'
import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { primerError } from '@/shared/utils/primerError'
import { useAuthStore } from '@/store/authStore'

import { destinoPostLogin } from '../utils/destinoPostLogin'

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const location = useLocation()
  const usuario = useAuthStore((estado) => estado.usuario)
  const cargando = useAuthStore((estado) => estado.cargando)
  const login = useAuthStore((estado) => estado.login)
  const [errorApi, setErrorApi] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '', confirmacion: '' },
    onSubmit: async ({ value }) => {
      setErrorApi(null)
      const username = value.username.trim()
      try {
        await register({
          username,
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        })
        // Cuenta creada: se inicia sesión con los mismos datos y el render siguiente redirige.
        await login({ username, password: value.password })
      } catch (error) {
        setErrorApi(handleApiError(error)) // por ejemplo, 409: usuario o email ya existen
      }
    },
  })

  if (!cargando && usuario) {
    return <Navigate to={destinoPostLogin(location.state)} replace />
  }

  return (
    <Card className="mx-auto w-full max-w-md p-6">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Crear cuenta</h1>
      <p className="mb-6 text-sm text-slate-500">Registrate para hacer tus pedidos.</p>

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
          name="username"
          validators={{
            onChange: ({ value }) => {
              const texto = value.trim()
              if (texto.length < 3) return 'Mínimo 3 caracteres'
              if (texto.length > 50) return 'Máximo 50 caracteres'
              return undefined
            },
          }}
        >
          {(campo) => (
            <Input
              label="Usuario"
              autoComplete="username"
              value={campo.state.value}
              onBlur={campo.handleBlur}
              onChange={(evento) => campo.handleChange(evento.target.value)}
              error={primerError(campo.state.meta.errors)}
            />
          )}
        </form.Field>

        <form.Field
          name="full_name"
          validators={{
            onChange: ({ value }) => {
              const texto = value.trim()
              if (!texto) return 'Ingresá tu nombre completo'
              if (texto.length > 100) return 'Máximo 100 caracteres'
              return undefined
            },
          }}
        >
          {(campo) => (
            <Input
              label="Nombre completo"
              autoComplete="name"
              value={campo.state.value}
              onBlur={campo.handleBlur}
              onChange={(evento) => campo.handleChange(evento.target.value)}
              error={primerError(campo.state.meta.errors)}
            />
          )}
        </form.Field>

        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => (REGEX_EMAIL.test(value.trim()) ? undefined : 'Ingresá un email válido'),
          }}
        >
          {(campo) => (
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={campo.state.value}
              onBlur={campo.handleBlur}
              onChange={(evento) => campo.handleChange(evento.target.value)}
              error={primerError(campo.state.meta.errors)}
            />
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => (value.length >= 8 ? undefined : 'Mínimo 8 caracteres'),
          }}
        >
          {(campo) => (
            <Input
              label="Contraseña"
              type="password"
              autoComplete="new-password"
              value={campo.state.value}
              onBlur={campo.handleBlur}
              onChange={(evento) => campo.handleChange(evento.target.value)}
              error={primerError(campo.state.meta.errors)}
            />
          )}
        </form.Field>

        <form.Field
          name="confirmacion"
          validators={{
            // Se vuelve a validar cuando cambia la contraseña.
            onChangeListenTo: ['password'],
            onChange: ({ value, fieldApi }) =>
              value === fieldApi.form.getFieldValue('password')
                ? undefined
                : 'Las contraseñas no coinciden',
          }}
        >
          {(campo) => (
            <Input
              label="Repetir contraseña"
              type="password"
              autoComplete="new-password"
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
            <Button type="submit" cargando={enviando} disabled={!puedeEnviar}>
              Crear cuenta
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-medium text-orange-600 hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </Card>
  )
}
