import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, className = '', ...resto }: InputProps) {
  const idGenerado = useId()
  const inputId = id ?? idGenerado
  const errorId = `${inputId}-error`

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-orange-500 disabled:bg-slate-100 ${
          error ? 'border-red-500' : 'border-slate-300'
        } ${className}`}
        {...resto}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
