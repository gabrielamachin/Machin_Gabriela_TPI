import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/shared/ui/Button'

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-100'
  }`

export function Navbar() {
  const navigate = useNavigate()
  const usuario = useAuthStore((estado) => estado.usuario)
  const logout = useAuthStore((estado) => estado.logout)
  const cantidadCarrito = useCartStore((estado) =>
    estado.items.reduce((suma, item) => suma + item.cantidad, 0),
  )

  const cerrarSesion = async () => {
    try {
      await logout()
    } catch {
      // Si la API falla, el store igual limpió la sesión local.
    }
    navigate('/login')
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-lg font-bold text-orange-600">
            Food Store
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={claseEnlace}>
              Catálogo
            </NavLink>
            <NavLink to="/carrito" className={claseEnlace}>
              Carrito{cantidadCarrito > 0 && ` (${cantidadCarrito})`}
            </NavLink>
            {usuario && (
              <NavLink to="/mis-pedidos" className={claseEnlace}>
                Mis pedidos
              </NavLink>
            )}
            {/* Solo para admin. La protección real está en el backend (require_role). */}
            {usuario?.role === 'admin' && (
              <NavLink to="/admin/resumen" className={claseEnlace}>
                Panel
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <span className="text-sm text-slate-600">
                {usuario.full_name}{' '}
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                  {usuario.role === 'admin' ? 'Administrador' : 'Cliente'}
                </span>
              </span>
              <Button variante="secondary" tamano="sm" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={claseEnlace}>
                Iniciar sesión
              </NavLink>
              <NavLink to="/register" className={claseEnlace}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
