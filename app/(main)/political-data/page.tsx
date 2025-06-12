// pages/political-data.tsx
"use client" // Client Componentであることを明示
import PoliticiansList from "@/components/politicians-list" // パス確認済み

export default function PoliticalDataPage() {
  return (
    <div className="container mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">政治データダッシュボード</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <PoliticiansList />
        </div>
        <div>{/* ここに PartiesList や FundOrgsList が入ることになる。今は空でいい。 */}</div>
      </div>
    </div>
  )
}
