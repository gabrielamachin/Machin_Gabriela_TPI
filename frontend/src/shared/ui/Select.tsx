import { useId } from 'react'
import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export function Select({ label, error, id, className = '', children, ...resto }: SelectProps) {
  const idGenerado = useId()
  const selectId = id ?? idGenerado
  const errorId = `${selectId}-error`

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-orange-500 disabled:bg-slate-100 ${
          error ? 'border-red-500' : 'border-slate-300'
        } ${className}`}
        {...resto}
      >
        {children}
      </select>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
