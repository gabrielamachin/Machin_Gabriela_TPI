import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Producto } from '@/features/productos/types'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
}

interface CartState {
  items: ItemCarrito[]
  agregar: (producto: Producto, cantidad?: number) => void
  quitar: (productoId: number) => void
  /** Una cantidad menor a 1 quita el ítem. */
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) =>
        set((estado) => {
          const existente = estado.items.find((item) => item.producto_id === producto.id)
          if (existente) {
            return {
              items: estado.items.map((item) =>
                item.producto_id === producto.id
                  ? { ...item, cantidad: item.cantidad + cantidad }
                  : item,
              ),
            }
          }
          return {
            items: [
              ...estado.items,
              {
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
                cantidad,
              },
            ],
          }
        }),

      quitar: (productoId) =>
        set((estado) => ({ items: estado.items.filter((item) => item.producto_id !== productoId) })),

      cambiarCantidad: (productoId, cantidad) => {
        if (!Number.isFinite(cantidad) || cantidad < 1) {
          get().quitar(productoId)
          return
        }
        set((estado) => ({
          items: estado.items.map((item) =>
            item.producto_id === productoId ? { ...item, cantidad: Math.floor(cantidad) } : item,
          ),
        }))
      },

      vaciar: () => set({ items: [] }),

      total: () =>
        get().items.reduce((suma, item) => suma + item.precio_unitario * item.cantidad, 0),
    }),
    {
      name: 'food-store-cart',
      partialize: (estado) => ({ items: estado.items }),
    },
  ),
)
