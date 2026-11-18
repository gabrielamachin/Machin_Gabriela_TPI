import { Outlet } from 'react-router-dom'

import { Navbar } from './Navbar'

/** Navbar + el contenido de la ruta activa. */
export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
