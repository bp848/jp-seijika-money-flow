"use client"

import { useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { ArrowRightLeft, Landmark, Users } from "lucide-react"
import { SummaryStatCard } from "./components/summary-stat-card"
import { TransactionsDataTable } from "./components/transactions-data-table"
import { columns, type DisplayTransaction } from "./components/columns"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

// Dynamically import the chart component with SSR disabled
const FlowSankeyChart = dynamic(() => import("./components/flow-sankey-chart").then((mod) => mod.FlowSankeyChart), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[800px]" />,
})

interface SankeyNode {
  id: number
  label: string
  originalId: number
}

interface SankeyLink {
  source: number
  target: number
  value: number
  label: string
}

interface FlowData {
  summary: {
    totalTransactions: number
    totalOrganizations: number
    totalRevenue: number
  }
  transactions: DisplayTransaction[]
  sankeyNodes: SankeyNode[]
  sankeyLinks: SankeyLink[]
}

export default function FlowPage() {
  const [data, setData] = useState<FlowData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [minAmountFilter, setMinAmountFilter] = useState<number>(0) // Default 0万円

  const fetchData = useCallback(async (minAmount: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/flow-data?minAmount=${minAmount}`)
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || "データの取得に失敗しました。")
      }
      const result: FlowData = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message)
      console.error("Fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(minAmountFilter)
  }, [fetchData, minAmountFilter])

  const handleSliderChange = (value: number[]) => {
    setMinAmountFilter(value[0])
  }

  const onSliderCommit = (value: number[]) => {
    fetchData(value[0])
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          政治資金フローダッシュボード
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          政治資金のトランザクションと流れを可視化します。
        </p>
      </header>

      {isLoading && !data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      )}

      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          <h3 className="font-semibold">エラー</h3>
          <p>{error}</p>
          <p className="mt-2 text-sm">ページをリロードするか、後でもう一度お試しください。</p>
        </div>
      )}

      {!isLoading && data && (
        <div className="space-y-8">
          {/* Summary Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">サマリー</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <SummaryStatCard
                title="総トランザクション数"
                value={data.summary.totalTransactions.toLocaleString()}
                icon={ArrowRightLeft}
              />
              <SummaryStatCard
                title="関連団体/個人 数"
                value={data.summary.totalOrganizations.toLocaleString()}
                icon={Users}
              />
              <SummaryStatCard
                title="総収入額 (推定)"
                value={`¥${(data.summary.totalRevenue / 100000000).toFixed(2)} 億円`}
                icon={Landmark}
                description="表示データに基づく推定値"
              />
            </div>
          </section>

          {/* Latest Transactions Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">最新の資金トランザクション (上位20件)</h2>
            <TransactionsDataTable columns={columns} data={data.transactions} />
          </section>

          {/* Fund Flow Network Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">資金フローネットワーク図</h2>
            <div className="mb-6 p-4 border rounded-lg bg-card">
              <Label htmlFor="minAmountSlider" className="text-sm font-medium">
                表示する最小金額: {minAmountFilter.toLocaleString()} 万円以上 (上位100件まで)
              </Label>
              <Slider
                id="minAmountSlider"
                min={0}
                max={10000} // 100億円 (10000万円)
                step={100} // 100万円単位
                defaultValue={[minAmountFilter]}
                onValueChange={handleSliderChange} // Update display value continuously
                onValueCommit={onSliderCommit} // Fetch data on release
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">スライダーを調整後、データが再読み込みされます。</p>
            </div>
            {isLoading ? (
              <Skeleton className="w-full h-[800px]" />
            ) : (
              <FlowSankeyChart nodes={data.sankeyNodes} links={data.sankeyLinks} />
            )}
          </section>
        </div>
      )}
    </div>
  )
}
