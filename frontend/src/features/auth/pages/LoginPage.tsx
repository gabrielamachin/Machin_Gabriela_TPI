import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'

import { handleApiError } from '@/shared/api/handleApiError'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { primerError } from '@/shared/utils/primerError'
import { useAuthStore } from '@/store/authStore'

import { destinoPostLogin } from '../utils/destinoPostLogin'

export function LoginPage() {
  const location = useLocation()
  const usuario = useAuthStore((estado) => estado.usuario)
  const cargando = useAuthStore((estado) => estado.cargando)
  const login = useAuthStore((estado) => estado.login)
  const [errorApi, setErrorApi] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setErrorApi(null)
      try {
        await login({ username: value.username.trim(), password: value.password })
        // Al quedar con sesión, el render siguiente redirige (ver más abajo).
      } catch (error) {
        setErrorApi(handleApiError(error))
      }
    },
  })

  // Con sesión confirmada no tiene sentido ver el login: vuelve a donde estaba.
  if (!cargando && usuario) {
    return <Navigate to={destinoPostLogin(location.state)} replace />
  }

  return (
    <Card className="mx-auto w-full max-w-md p-6">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Iniciar sesión</h1>
      <p className="mb-6 text-sm text-slate-500">Ingresá con tu usuario y contraseña.</p>

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
            onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá tu usuario'),
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
          name="password"
          validators={{
            onChange: ({ value }) => (value ? undefined : 'Ingresá tu contraseña'),
          }}
        >
          {(campo) => (
            <Input
              label="Contraseña"
              type="password"
              autoComplete="current-password"
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
              Ingresar
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        ¿No tenés cuenta?{' '}
        <Link to="/register" className="font-medium text-orange-600 hover:underline">
          Registrate
        </Link>
      </p>
    </Card>
  )
}
