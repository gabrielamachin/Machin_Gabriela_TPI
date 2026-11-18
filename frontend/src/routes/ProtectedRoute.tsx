import { Navigate, Outlet, useLocation } from 'react-router-dom'

import type { Rol } from '@/features/auth/types'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  /** Roles permitidos. Si se omite, alcanza con tener sesión. */
  roles?: Rol[]
}

/**
 * Ruta protegida (se usa como "layout route"):
 *  - mientras checkSession confirma la sesión, muestra un indicador;
 *  - sin sesión, redirige a /login;
 *  - con sesión pero sin el rol permitido, redirige a /unauthorized.
 *
 * Es solo la protección de la interfaz: la protección real está en el backend (require_role).
 */
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((estado) => estado.usuario)
  const cargando = useAuthStore((estado) => estado.cargando)
  const location = useLocation()

  if (cargando) {
    return (
      <div role="status" className="grid min-h-[40vh] place-items-center text-slate-500">
        Verificando sesión…
      </div>
    )
  }

  if (!usuario) {
    // `desde` permite volver a la pantalla pedida después de iniciar sesión.
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  }

  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
