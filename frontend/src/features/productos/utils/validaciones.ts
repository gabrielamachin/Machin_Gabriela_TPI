// Los campos numéricos de los formularios se manejan como texto y se validan/convierten acá.

export function aNumero(texto: string): number {
  return Number(texto.trim().replace(',', '.'))
}

export function validarPrecio(texto: string): string | undefined {
  if (!texto.trim()) return 'Ingresá el precio'
  const numero = aNumero(texto)
  if (!Number.isFinite(numero)) return 'Ingresá un número válido'
  if (numero < 0) return 'El precio no puede ser negativo'
  return undefined
}

export function validarStock(texto: string): string | undefined {
  if (!texto.trim()) return 'Ingresá el stock'
  const numero = Number(texto)
  if (!Number.isInteger(numero)) return 'El stock debe ser un número entero'
  if (numero < 0) return 'El stock no puede ser negativo'
  return undefined
}

/** La imagen es opcional; si se completa debe ser una URL http(s). */
export function validarUrlImagen(texto: string): string | undefined {
  const url = texto.trim()
  if (!url) return undefined
  try {
    const { protocol } = new URL(url)
    return protocol === 'http:' || protocol === 'https:'
      ? undefined
      : 'La URL debe empezar con http:// o https://'
  } catch {
    return 'Ingresá una URL válida'
  }
}
