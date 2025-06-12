// app/(main)/explorer/[entityType]/[entityId]/loading.tsx
// No changes needed to loading.tsx based on this request,
// but ensuring it exists and provides a good skeleton for the new layout is important.
// The existing loading.tsx should still work as a general fallback.
// If you want a skeleton more specific to THIS new layout, it would need to be updated.
// For now, I'll assume the existing one is sufficient or can be updated separately.
// To be safe, I'll provide a slightly more fitting skeleton for this new layout.

import { Skeleton } from "@/components/ui/skeleton"

export default function ExplorerV2Loading() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 md:p-6">
      <Skeleton className="h-9 w-24 mb-6 bg-gray-700" /> {/* Back button */}
      {/* Header Skeleton */}
      <div className="mb-8 p-6 bg-gray-800/60 border border-gray-700 rounded-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gray-700" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48 bg-gray-700" />
              <Skeleton className="h-5 w-32 bg-gray-700" />
            </div>
          </div>
          <div className="text-center md:text-right space-y-1">
            <Skeleton className="h-4 w-20 bg-gray-700" />
            <Skeleton className="h-9 w-36 bg-gray-700" />
          </div>
        </div>
      </div>
      {/* Core Two-Column Layout Skeleton */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column Skeleton */}
        <div className="lg:w-[65%] space-y-6">
          <Skeleton className="h-[500px] w-full rounded-lg bg-gray-800/60 border border-gray-700" />{" "}
          {/* Network Visualizer Card */}
          <Skeleton className="h-[400px] w-full rounded-lg bg-gray-800/60 border border-gray-700" />{" "}
          {/* Transaction List Card */}
        </div>

        {/* Right Column Skeleton (Summary) */}
        <div className="lg:w-[35%]">
          <Skeleton className="h-[600px] w-full rounded-lg bg-gray-800/60 border border-gray-700" />{" "}
          {/* Summary Widget Card */}
        </div>
      </div>
    </div>
  )
}
