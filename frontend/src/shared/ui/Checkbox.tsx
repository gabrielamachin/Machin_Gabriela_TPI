import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

export function Checkbox({ label, id, className = '', ...resto }: CheckboxProps) {
  const idGenerado = useId()
  const checkboxId = id ?? idGenerado

  return (
    <div className="flex items-center gap-2">
      <input
        id={checkboxId}
        type="checkbox"
        className={`h-4 w-4 rounded border-slate-300 accent-orange-600 ${className}`}
        {...resto}
      />
      <label htmlFor={checkboxId} className="text-sm text-slate-700">
        {label}
      </label>
    </div>
  )
}
