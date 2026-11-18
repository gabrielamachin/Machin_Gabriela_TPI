import type { ColumnDef } from '@tanstack/react-table'
import { useCallback, useMemo, useState } from 'react'

import { handleApiError } from '@/shared/api/handleApiError'
import { DataTable } from '@/shared/components/DataTable'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Skeleton } from '@/shared/components/Skeleton'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { useAuthStore } from '@/store/authStore'

import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '../hooks/useUsuarios'
import type { Usuario } from '../types'

export function AdminUsuariosPage() {
  const usuarioSesion = useAuthStore((estado) => estado.usuario)
  const usuarios = useUsuarios()
  const activar = useActivarUsuario()
  const desactivar = useDesactivarUsuario()

  const [desactivando, setDesactivando] = useState<Usuario | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const [errorDesactivar, setErrorDesactivar] = useState<string | null>(null)

  const sesionId = usuarioSesion?.id
  const ocupado = activar.isPending || desactivar.isPending
  const datos = usuarios.data ?? []

  const { mutate: mutarActivar } = activar
  const activarUsuario = useCallback(
    (usuario: Usuario) => {
      setErrorAccion(null)
      mutarActivar(usuario.id, {
        onError: (error) => setErrorAccion(handleApiError(error, 'No se pudo activar el usuario.')),
      })
    },
    [mutarActivar],
  )

  const columnas = useMemo<ColumnDef<Usuario>[]>(
    () => [
      { accessorKey: 'username', header: 'Usuario' },
      { accessorKey: 'full_name', header: 'Nombre' },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'role',
        header: 'Rol',
        cell: ({ row }) =>
          row.original.role === 'admin' ? (
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
              Administrador
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              Cliente
            </span>
          ),
      },
      {
        accessorKey: 'disabled',
        header: 'Estado',
        cell: ({ row }) =>
          row.original.disabled ? (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
              Desactivado
            </span>
          ) : (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
              Activo
            </span>
          ),
      },
      {
        id: 'acciones',
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => {
          const usuario = row.original
          if (usuario.disabled) {
            return (
              <div className="flex justify-end">
                <Button tamano="sm" disabled={ocupado} onClick={() => activarUsuario(usuario)}>
                  Activar
                </Button>
              </div>
            )
          }
          // El admin no puede desactivarse a sí mismo: el botón no se muestra en su fila.
          if (usuario.id === sesionId) return null
          return (
            <div className="flex justify-end">
              <Button
                variante="danger"
                tamano="sm"
                disabled={ocupado}
                onClick={() => {
                  setErrorDesactivar(null)
                  setDesactivando(usuario)
                }}
              >
                Desactivar
              </Button>
            </div>
          )
        },
      },
    ],
    [sesionId, ocupado, activarUsuario],
  )

  const confirmarDesactivacion = () => {
    if (!desactivando) return
    desactivar.mutate(desactivando.id, {
      onSuccess: () => setDesactivando(null),
      onError: (error) => setErrorDesactivar(handleApiError(error, 'No se pudo desactivar el usuario.')),
    })
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
        <p className="text-sm text-slate-500">Activá o desactivá el acceso de cada cuenta.</p>
      </div>

      {errorAccion && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorAccion}
        </p>
      )}

      {usuarios.isLoading ? (
        <div className="flex flex-col gap-2" aria-hidden="true">
          {Array.from({ length: 5 }, (_, indice) => (
            <Skeleton key={indice} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : usuarios.isError ? (
        <EstadoError
          mensaje={handleApiError(usuarios.error, 'No se pudieron cargar los usuarios.')}
          onReintentar={() => void usuarios.refetch()}
        />
      ) : datos.length === 0 ? (
        <EstadoVacio titulo="No hay usuarios" />
      ) : (
        <DataTable datos={datos} columnas={columnas} />
      )}

      <Modal abierto={desactivando !== null} onCerrar={() => setDesactivando(null)} titulo="Desactivar usuario">
        <p className="text-sm text-slate-600">
          ¿Desactivar a <strong>{desactivando?.full_name}</strong> ({desactivando?.username})? No va a poder
          iniciar sesión, y si tiene una sesión abierta se le cierra en su próxima acción. Podés volver a
          activarlo cuando quieras.
        </p>
        {errorDesactivar && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorDesactivar}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <Button variante="secondary" onClick={() => setDesactivando(null)}>
            Cancelar
          </Button>
          <Button variante="danger" cargando={desactivar.isPending} onClick={confirmarDesactivacion}>
            Desactivar
          </Button>
        </div>
      </Modal>
    </section>
  )
}
