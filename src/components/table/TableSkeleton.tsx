import { Skeleton } from '../ui/skeleton'

export const TableSkeleton = () => {
    return (
        <Skeleton>
            <Skeleton className="w-full h-12 mb-10" />

            <Skeleton className="w-full h-14 mb-1" />
            <Skeleton className="w-full h-14 mb-1" />
            <Skeleton className="w-full h-14 mb-1" />
            <Skeleton className="w-full h-14 mb-1" />
            <Skeleton className="w-full h-14 mb-1" />

            <p className='text-center pt-8 pb-2'>Cargando información...</p>
        </Skeleton>
    )
}
