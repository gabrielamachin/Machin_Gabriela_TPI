import type { EstadoPedido } from './types'

export const ESTADOS_PEDIDO: readonly EstadoPedido[] = [
  'PENDIENTE',
  'EN_PREPARACION',
  'ENTREGADO',
  'CANCELADO',
]

export const ETIQUETAS_ESTADO: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

export const ETIQUETAS_PAGO = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
} as const

/**
 * Transiciones válidas (RN-02). Es un espejo del mapa del backend, que es quien valida de verdad.
 * Acá solo sirve para mostrar los botones correctos.
 */
export const TRANSICIONES: Record<EstadoPedido, readonly EstadoPedido[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
}

/** Texto del botón que lleva un pedido a cada estado. */
export const ETIQUETAS_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: 'Volver a pendiente',
  EN_PREPARACION: 'Preparar',
  ENTREGADO: 'Marcar entregado',
  CANCELADO: 'Cancelar',
}

/** Estado al que se avanza desde el actual (el que no es CANCELADO), si lo hay. */
export function siguienteEstado(actual: EstadoPedido): EstadoPedido | undefined {
  return TRANSICIONES[actual].find((estado) => estado !== 'CANCELADO')
}

export function puedeCancelar(actual: EstadoPedido): boolean {
  return TRANSICIONES[actual].includes('CANCELADO')
}
