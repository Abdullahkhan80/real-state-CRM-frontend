import Skeleton from "@/components/ui/skeleton";

export default function ActivityLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-96 mb-8" />
      <Skeleton className="h-10 w-full mb-6" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
