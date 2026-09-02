export function PageSkeleton() {
  return (
    <div className="flex h-screen w-full bg-bg-primary">
      {/* Sidebar skeleton */}
      <div className="w-[248px] border-r border-border-light bg-white flex flex-col gap-2 p-4 shrink-0">
        <div className="skeleton h-8 w-32 mb-4" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="skeleton h-9 w-full rounded" />
        ))}
      </div>
      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="h-[60px] border-b border-border-light skeleton opacity-30" />
        <div className="flex-1 p-8 flex flex-col gap-6">
          <div className="skeleton h-8 w-64" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-28 rounded-lg" />
            ))}
          </div>
          <div className="skeleton h-64 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
