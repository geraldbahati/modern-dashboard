import { Skeleton } from "@workspace/ui/components/skeleton";

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col relative overflow-hidden rounded-xl border bg-background shadow-sm">
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
        <Skeleton className="h-64 w-64 rounded-full" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
