import Skeleton from "@/components/ui/skeleton";

export default function LeadsLoading() {
  return (
    <div>
      <div className="mb-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-12 w-full mb-6" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
