import { NavLink, Outlet } from 'react-router-dom'

const SECCIONES = [
  { to: '/admin/resumen', texto: 'Resumen' },
  { to: '/admin/categorias', texto: 'Categorías' },
  { to: '/admin/productos', texto: 'Productos' },
  { to: '/admin/pedidos', texto: 'Pedidos' },
  { to: '/admin/usuarios', texto: 'Usuarios' },
]

const claseSeccion = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`

/** Menú de secciones del panel de administración + el contenido de la sección activa. */
export function AdminLayout() {
  return (
    <div className="flex flex-col gap-6">
      <nav
        aria-label="Administración"
        className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1"
      >
        {SECCIONES.map((seccion) => (
          <NavLink key={seccion.to} to={seccion.to} className={claseSeccion}>
            {seccion.texto}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
