import type { ButtonHTMLAttributes } from 'react'

export type Variante = 'primary' | 'secondary' | 'danger' | 'ghost'
export type Tamano = 'sm' | 'md'

const VARIANTES: Record<Variante, string> = {
  primary: 'bg-orange-600 text-white hover:bg-orange-700 focus-visible:outline-orange-600',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-slate-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
  ghost: 'text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-400',
}

const TAMANOS: Record<Tamano, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
}

/** Clases de un botón. Las comparte ButtonLink para que un enlace se vea igual que un botón. */
export function clasesBoton(variante: Variante, tamano: Tamano, extra = ''): string {
  return `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${TAMANOS[tamano]} ${extra}`
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamano?: Tamano
  cargando?: boolean
}

export function Button({
  variante = 'primary',
  tamano = 'md',
  cargando = false,
  type = 'button', // por defecto no envía formularios: los submit lo indican explícitamente
  disabled,
  className = '',
  children,
  ...resto
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={clasesBoton(variante, tamano, className)}
      {...resto}
    >
      {cargando ? 'Procesando…' : children}
    </button>
  )
}
