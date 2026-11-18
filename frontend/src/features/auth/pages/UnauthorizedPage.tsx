import { Link } from 'react-router-dom'

import { EstadoVacio } from '@/shared/components/EstadoVacio'

export function UnauthorizedPage() {
  return (
    <EstadoVacio
      titulo="No tenés permiso para ver esta pantalla"
      descripcion="Tu cuenta no tiene el rol necesario para acceder a esta sección."
    >
      <Link to="/" className="text-sm font-medium text-orange-600 hover:underline">
        Volver al inicio
      </Link>
    </EstadoVacio>
  )
}
