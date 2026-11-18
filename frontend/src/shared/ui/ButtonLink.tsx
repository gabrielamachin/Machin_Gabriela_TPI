import { Link } from 'react-router-dom'
import type { LinkProps } from 'react-router-dom'

import { clasesBoton } from './Button'
import type { Tamano, Variante } from './Button'

type ButtonLinkProps = Omit<LinkProps, 'className'> & {
  variante?: Variante
  tamano?: Tamano
  className?: string
}

/** Enlace de navegación con aspecto de botón. */
export function ButtonLink({ variante = 'primary', tamano = 'md', className = '', ...resto }: ButtonLinkProps) {
  return <Link className={clasesBoton(variante, tamano, className)} {...resto} />
}
