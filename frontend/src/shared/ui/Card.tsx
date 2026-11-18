import type { HTMLAttributes } from 'react'

export function Card({ className = '', children, ...resto }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`} {...resto}>
      {children}
    </div>
  )
}
