"use client"

import { useEffect, useState, useCallback } from "react"
import { TrendingUp, TrendingDown, Scale, ListFilter, Share2 } from "lucide-react"
import { SummaryStatCard } from "@/app/flow/components/summary-stat-card"
import { TransactionsDataTable } from "@/app/flow/components/transactions-data-table"
import { columns as defaultTransactionColumns, type DisplayTransaction } from "@/app/flow/components/columns"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import type { DateRange } from "react-day-picker"
import { subDays } from "date-fns"
import { FlowSankeyChart, type SankeyData } from "@/app/flow/components/flow-sankey-chart" // Import SankeyChart and its data type
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { ColumnDef } from "@tanstack/react-table"

interface CashFlowSummary {
  totalIncome: number
  totalExpenditure: number
  netCashFlow: number
  transactionCount: number
}

interface CashFlowPageData {
  // Renamed from CashFlowData to avoid conflict
  summary: CashFlowSummary
  transactions: DisplayTransaction[]
  sankeyData: SankeyData
}

// Extend DisplayTransaction for cash flow page if needed, or adjust columns
const cashFlowTransactionColumns: ColumnDef<DisplayTransaction>[] = [
  ...defaultTransactionColumns,
  // Add or modify columns specific to cash flow if necessary
  // For example, to show 'category' or 'description' if they exist on DisplayTransaction
  // {
  //   accessorKey: "category",
  //   header: "カテゴリ",
  // },
  // {
  //   accessorKey: "description",
  //   header: "摘要",
  // },
]

export default function CashFlowPage() {
  const [data, setData] = useState<CashFlowPageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 365 * 2), // Default to 2 years for more data
    to: new Date(),
  })

  const fetchData = useCallback(async (currentDateRange?: DateRange) => {
    setIsLoading(true)
    setError(null)
    let queryString = ""
    if (currentDateRange?.from && currentDateRange?.to) {
      queryString = `?from=${currentDateRange.from.toISOString()}&to=${currentDateRange.to.toISOString()}`
    }

    try {
      const response = await fetch(`/api/cash-flow${queryString}`)
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || "データの取得に失敗しました。")
      }
      const result: CashFlowPageData = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message)
      console.error("Fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(dateRange)
  }, [fetchData, dateRange])

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">キャッシュフロー分析</h1>
        <p className="mt-1 text-sm text-muted-foreground">指定期間内の資金の収入と支出を詳細に分析します。</p>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListFilter className="h-5 w-5" />
            フィルター
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="date-range" className="block text-sm font-medium text-muted-foreground mb-1">
                期間選択
              </label>
              <DateRangePicker
                range={dateRange}
                onRangeChange={setDateRange}
                className="w-full max-w-xs" // Added className for styling
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && !data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-[500px] w-full" /> {/* Placeholder for Sankey */}
          <Skeleton className="h-96 w-full" /> {/* Placeholder for Table */}
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && data && (
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">サマリー</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <SummaryStatCard
                title="総収入"
                value={`¥${(data.summary.totalIncome / 10000).toLocaleString()} 万円`}
                icon={TrendingUp}
                className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700"
              />
              <SummaryStatCard
                title="総支出"
                value={`¥${(data.summary.totalExpenditure / 10000).toLocaleString()} 万円`}
                icon={TrendingDown}
                className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700"
              />
              <SummaryStatCard
                title="純キャッシュフロー"
                value={`¥${(data.summary.netCashFlow / 10000).toLocaleString()} 万円`}
                icon={Scale}
                className={
                  data.summary.netCashFlow >= 0
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700"
                    : "bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700"
                }
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              資金フロー Sankey図
            </h2>
            {data.sankeyData && data.sankeyData.nodes.length > 0 && data.sankeyData.links.length > 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <FlowSankeyChart nodes={data.sankeyData.nodes} links={data.sankeyData.links} height={500} />
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertTitle>Sankey図データなし</AlertTitle>
                <AlertDescription>
                  表示可能なSankey図データが見つかりませんでした。期間内に適切な収入・支出データがないか、
                  支出にカテゴリ情報が付与されていない可能性があります。
                </AlertDescription>
              </Alert>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">トランザクション詳細</h2>
            <TransactionsDataTable columns={cashFlowTransactionColumns} data={data.transactions} />
          </section>
        </div>
      )}
    </div>
  )
}
