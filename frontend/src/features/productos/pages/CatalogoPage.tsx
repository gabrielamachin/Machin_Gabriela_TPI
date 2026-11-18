import { useState } from 'react'
import type { FormEvent } from 'react'

import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Paginacion } from '@/shared/components/Paginacion'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'

import { ProductoCard } from '../components/ProductoCard'
import { ProductoCardSkeleton } from '../components/ProductoCardSkeleton'
import { useProductos } from '../hooks/useProductos'
import type { FiltrosProductos } from '../types'

const LIMITE = 8
const FILTROS_INICIALES: FiltrosProductos = { pagina: 0, limite: LIMITE }

export function CatalogoPage() {
  const [filtros, setFiltros] = useState<FiltrosProductos>(FILTROS_INICIALES)
  const [busqueda, setBusqueda] = useState('') // texto del input; se aplica al buscar

  const productos = useProductos(filtros)
  const categorias = useCategorias()

  const hayFiltros = filtros.search !== undefined || filtros.categoria_id !== undefined

  const buscar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setFiltros((previos) => ({ ...previos, search: busqueda.trim() || undefined, pagina: 0 }))
  }

  const cambiarCategoria = (valor: string) => {
    setFiltros((previos) => ({
      ...previos,
      categoria_id: valor ? Number(valor) : undefined,
      pagina: 0, // al cambiar un filtro se vuelve a la primera página
    }))
  }

  const cambiarPagina = (pagina: number) => {
    setFiltros((previos) => ({ ...previos, pagina }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const limpiar = () => {
    setBusqueda('')
    setFiltros(FILTROS_INICIALES)
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Catálogo</h1>
        <p className="text-sm text-slate-500">Elegí tus productos y armá tu pedido.</p>
      </div>

      <form onSubmit={buscar} className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <Input
            label="Buscar"
            type="search"
            placeholder="Nombre del producto"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
          />
        </div>
        <div className="min-w-48">
          <Select
            label="Categoría"
            value={filtros.categoria_id ?? ''}
            onChange={(evento) => cambiarCategoria(evento.target.value)}
            disabled={categorias.isPending}
          >
            <option value="">Todas</option>
            {categorias.data?.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit">Buscar</Button>
        {hayFiltros && (
          <Button variante="ghost" onClick={limpiar}>
            Limpiar filtros
          </Button>
        )}
      </form>

      {productos.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: LIMITE }, (_, indice) => (
            <ProductoCardSkeleton key={indice} />
          ))}
        </div>
      ) : productos.isError ? (
        <EstadoError
          mensaje={handleApiError(productos.error, 'No se pudo cargar el catálogo.')}
          onReintentar={() => void productos.refetch()}
        />
      ) : !productos.data ? null : productos.data.items.length === 0 ? (
        <EstadoVacio
          titulo={hayFiltros ? 'No encontramos productos con esos filtros' : 'Todavía no hay productos'}
          descripcion={
            hayFiltros
              ? 'Probá con otra búsqueda o con otra categoría.'
              : 'Volvé más tarde: estamos preparando el catálogo.'
          }
        >
          {hayFiltros && (
            <Button variante="secondary" onClick={limpiar}>
              Limpiar filtros
            </Button>
          )}
        </EstadoVacio>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productos.data.items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
          <Paginacion
            pagina={filtros.pagina}
            limite={filtros.limite}
            total={productos.data.total}
            onCambiar={cambiarPagina}
          />
        </>
      )}
    </section>
  )
}
