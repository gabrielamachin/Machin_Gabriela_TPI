import { Skeleton } from '@/shared/components/Skeleton'
import { Card } from '@/shared/ui/Card'

/** Tarjeta de producto "vacía" que se muestra mientras carga el catálogo. */
export function ProductoCardSkeleton() {
  return (
    <Card className="overflow-hidden" aria-hidden="true">
      <Skeleton className="aspect-3/2 w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-full" />
      </div>
    </Card>
  )
}
