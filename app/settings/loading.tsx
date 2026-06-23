import Skeleton from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-96 mb-8" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
