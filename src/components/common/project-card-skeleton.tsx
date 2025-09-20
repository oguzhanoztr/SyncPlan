import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProjectCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-8" />
        </div>

        <div className="flex items-center justify-between text-sm">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <div className="flex -space-x-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full" />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ProjectGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  )
}