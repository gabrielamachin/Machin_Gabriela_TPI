import { useId } from 'react'
import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, id, className = '', ...resto }: TextareaProps) {
  const idGenerado = useId()
  const textareaId = id ?? idGenerado
  const errorId = `${textareaId}-error`

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`min-h-24 rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-orange-500 disabled:bg-slate-100 ${
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
