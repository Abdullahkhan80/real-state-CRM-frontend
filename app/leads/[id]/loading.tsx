import Skeleton from "@/components/ui/skeleton";

export default function LeadDetailLoading() {
  return (
    <div>
      <Skeleton className="h-4 w-24" />
      <div className="flex items-center justify-between mt-2 mb-8">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
