export interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
}

/** Datos del formulario de alta y edición de una categoría. */
export interface CategoriaInput {
  nombre: string
  descripcion: string | null
}
