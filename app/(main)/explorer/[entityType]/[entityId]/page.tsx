// app/(main)/explorer/[entityType]/[entityId]/page.tsx
"use client"

import { useEffect, useState, useMemo } from "react" // Removed useRef as sticky summary is gone
import { useParams, useRouter } from "next/navigation"
import Link from "next/link" // Added for drill-down links
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, ZoomIn, ZoomOut, Filter, CalendarDays, TrendingUp, TrendingDown } from "lucide-react"
// Separator might not be needed as much with the new layout
import { EnhancedDataTable, type EnhancedColumnDef } from "@/components/dashboard/enhanced-data-table"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Placeholder types - align with your actual data structures
type EntityType = "politician" | "party" | "branch" | "fund-group" | "corporate" | "individual" | "unknown" // Added more for linking

interface EntityDetails {
  id: string
  name: string
  entityType: EntityType
  avatarUrl?: string
  partyName?: string
  netBalance: number
}

// For linking, counterparty should ideally have an ID and type
interface CounterpartyLink {
  id: string // This would be the entity ID of the counterparty
  name: string
  type: EntityType // Type of the counterparty entity
}

interface Transaction {
  id: string
  date: string
  // counterparty: string // Old
  counterparty: CounterpartyLink // New: For linking
  purpose: string
  type: "income" | "expense"
  amount: number
  flagged?: boolean
  flagReason?: string
}

interface NetworkNode {
  id: string
  label: string
  type: "entity" | "income_source" | "expenditure_target" | "industry_group"
  color?: string
  industry?: string
}

interface NetworkEdge {
  source: string
  target: string
  amount: number
  label?: string
}

interface NetworkData {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
  minDate?: string
  maxDate?: string
  industries?: string[]
}

interface TopListItem {
  // id: string; // ID of the donor/recipient entity for linking
  // entityType: EntityType; // Type of the donor/recipient entity
  counterparty: CounterpartyLink // Use the same structure for consistency
  amount: number
}

interface SummaryStats {
  totalIncome: number
  totalExpenditure: number
  netBalance: number // Still needed for main header
  // donationCount: number // Removed as per new layout focus
  // averageDonationAmount: number // Removed
  topIncomeSources: TopListItem[] // Uses TopListItem for linkable names
  topExpenditureTargets: TopListItem[] // Uses TopListItem for linkable names
}

// MOCK API FUNCTIONS (Replace with actual API calls)
// Helper to create mock CounterpartyLink
const mockCounterparty = (name: string, type: EntityType = "unknown"): CounterpartyLink => ({
  id: name.toLowerCase().replace(/\s+/g, "-") + "-id", // Generate a mock ID
  name,
  type,
})

const fetchEntityDetailsExplorerV2 = async (
  entityType: EntityType,
  entityId: string,
): Promise<EntityDetails | null> => {
  await new Promise((resolve) => setTimeout(resolve, 150))
  if (entityType === "politician") {
    return {
      id: entityId,
      name: `岸田 文雄`, // Name will be dynamic, ID removed from here
      entityType: "politician",
      avatarUrl: "/placeholder-user.jpg",
      partyName: "自由民主党",
      netBalance: 123456789,
    }
  }
  return { id: entityId, name: `テスト団体 ${entityId}`, entityType, netBalance: 5000000, partyName: "テスト政党" }
}

const fetchNetworkDataV2 = async (entityType: EntityType, entityId: string): Promise<NetworkData> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  // Same network data as before
  return {
    nodes: [
      { id: entityId, label: "中心団体", type: "entity" },
      { id: "donor1", label: "A建設", type: "income_source", color: "hsl(var(--chart-2))", industry: "建設" },
      { id: "donor2", label: "B製薬", type: "income_source", color: "hsl(var(--chart-2))", industry: "製薬" },
      {
        id: "rec1",
        label: "Xコンサル",
        type: "expenditure_target",
        color: "hsl(var(--chart-1))",
        industry: "サービス",
      },
    ],
    edges: [
      { source: "donor1", target: entityId, amount: 5000000, label: "5M" },
      { source: "donor2", target: entityId, amount: 10000000, label: "10M" },
      { source: entityId, target: "rec1", amount: 2000000, label: "2M" },
    ],
    minDate: "2022-01-01",
    maxDate: "2023-12-31",
    industries: ["建設", "製薬", "サービス", "IT"],
  }
}

const fetchTransactionsV2 = async (entityType: EntityType, entityId: string): Promise<Transaction[]> => {
  await new Promise((resolve) => setTimeout(resolve, 250))
  return [
    {
      id: "tx1",
      date: "2023-05-10",
      counterparty: mockCounterparty("株式会社A建設", "corporate"),
      purpose: "寄付",
      type: "income",
      amount: 5000000,
    },
    {
      id: "tx2",
      date: "2023-06-15",
      counterparty: mockCounterparty("B製薬株式会社", "corporate"),
      purpose: "パーティー券購入",
      type: "income",
      amount: 10000000,
    },
    {
      id: "tx3",
      date: "2023-07-20",
      counterparty: mockCounterparty("Xコンサルティング", "corporate"),
      purpose: "調査費",
      type: "expense",
      amount: 2000000,
    },
    {
      id: "tx4",
      date: "2023-08-01",
      counterparty: mockCounterparty("支援団体C", "political-group"),
      purpose: "活動支援金",
      type: "income",
      amount: 2500000,
    },
    {
      id: "tx5",
      date: "2023-08-15",
      counterparty: mockCounterparty("印刷会社Y", "corporate"),
      purpose: "広報誌印刷代",
      type: "expense",
      amount: 750000,
    },
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `tx${i + 6}`,
      date: `2023-09-${10 + i}`,
      counterparty: mockCounterparty(`取引先${i}`, i % 2 === 0 ? "corporate" : "individual"),
      purpose: `目的${i}`,
      type: i % 3 === 0 ? "expense" : "income",
      amount: (i + 1) * 120000,
    })),
  ]
}

const fetchSummaryStatsV2 = async (entityType: EntityType, entityId: string): Promise<SummaryStats> => {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return {
    totalIncome: 35600000, // Updated to reflect more mock transactions
    totalExpenditure: 7850000, // Updated
    netBalance: 123456789,
    topIncomeSources: [
      { counterparty: mockCounterparty("B製薬株式会社", "corporate"), amount: 10000000 },
      { counterparty: mockCounterparty("株式会社A建設", "corporate"), amount: 5000000 },
      { counterparty: mockCounterparty("支援団体C", "political-group"), amount: 2500000 },
      { counterparty: mockCounterparty("取引先1", "individual"), amount: 240000 }, // Example from generated
      { counterparty: mockCounterparty("取引先0", "corporate"), amount: 120000 }, // Example from generated
    ]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5),
    topExpenditureTargets: [
      { counterparty: mockCounterparty("Xコンサルティング", "corporate"), amount: 2000000 },
      { counterparty: mockCounterparty("印刷会社Y", "corporate"), amount: 750000 },
      { counterparty: mockCounterparty("取引先2", "corporate"), amount: 360000 }, // Example from generated
      { counterparty: mockCounterparty("取引先5", "individual"), amount: 720000 },
      { counterparty: mockCounterparty("取引先8", "corporate"), amount: 1080000 },
    ]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5),
  }
}

// Main Page Component
export default function ExplorerPageV2() {
  const params = useParams()
  const router = useRouter()

  const entityTypeParam = params.entityType as EntityType
  const entityId = params.entityId as string

  const [entity, setEntity] = useState<EntityDetails | null>(null)
  const [networkData, setNetworkData] = useState<NetworkData | null>(null)
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<SummaryStats | null>(null)
  const [loading, setLoading] = useState(true)

  const [selectedIndustry, setSelectedIndustry] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 100])

  useEffect(() => {
    if (entityTypeParam && entityId) {
      setLoading(true)
      Promise.all([
        fetchEntityDetailsExplorerV2(entityTypeParam, entityId),
        fetchNetworkDataV2(entityTypeParam, entityId),
        fetchTransactionsV2(entityTypeParam, entityId),
        fetchSummaryStatsV2(entityTypeParam, entityId),
      ])
        .then(([details, netData, transData, sumData]) => {
          setEntity(details)
          setNetworkData(netData)
          setAllTransactions(transData)
          setSummary(sumData)
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [entityTypeParam, entityId])

  const incomeTransactions = useMemo(() => allTransactions.filter((tx) => tx.type === "income"), [allTransactions])
  const expenditureTransactions = useMemo(
    () => allTransactions.filter((tx) => tx.type === "expense"),
    [allTransactions],
  )

  const incomeTableColumns: EnhancedColumnDef<Transaction>[] = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "日付",
        cell: ({ row }) => new Date(row.original.date).toLocaleDateString("ja-JP"),
      },
      {
        accessorKey: "counterparty",
        header: "ソース",
        cell: ({ row }) => (
          <Link
            href={`/explorer/${row.original.counterparty.type}/${row.original.counterparty.id}`}
            className="text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            {row.original.counterparty.name}
          </Link>
        ),
      },
      {
        accessorKey: "amount",
        header: "金額",
        cell: ({ row }) => `¥${Number(row.original.amount).toLocaleString()}`,
        meta: { headerClassName: "text-right", cellClassName: "text-right font-mono" },
      },
    ],
    [],
  )

  const expenditureTableColumns: EnhancedColumnDef<Transaction>[] = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "日付",
        cell: ({ row }) => new Date(row.original.date).toLocaleDateString("ja-JP"),
      },
      {
        accessorKey: "counterparty",
        header: "ターゲット",
        cell: ({ row }) => (
          <Link
            href={`/explorer/${row.original.counterparty.type}/${row.original.counterparty.id}`}
            className="text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            {row.original.counterparty.name}
          </Link>
        ),
      },
      { accessorKey: "purpose", header: "目的" },
      {
        accessorKey: "amount",
        header: "金額",
        cell: ({ row }) => `¥${Number(row.original.amount).toLocaleString()}`,
        meta: { headerClassName: "text-right", cellClassName: "text-right font-mono" },
      },
    ],
    [],
  )

  const compactLinkableTableColumns: EnhancedColumnDef<TopListItem>[] = useMemo(
    () => [
      {
        accessorKey: "counterparty.name",
        header: "名称",
        cell: ({ row }) => (
          <Link
            href={`/explorer/${row.original.counterparty.type}/${row.original.counterparty.id}`}
            className="text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            {row.original.counterparty.name}
          </Link>
        ),
      },
      {
        accessorKey: "amount",
        header: "金額",
        cell: ({ row }) => `¥${Number(row.original.amount).toLocaleString()}`,
        meta: { headerClassName: "text-right", cellClassName: "text-right font-mono" },
      },
    ],
    [],
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        <span className="ml-3 text-xl">読み込み中...</span>
      </div>
    )
  }

  if (!entity || !networkData || !summary) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        データが見つかりません。
      </div>
    )
  }

  const minDateObj = networkData.minDate ? new Date(networkData.minDate) : new Date()
  const maxDateObj = networkData.maxDate ? new Date(networkData.maxDate) : new Date()
  const currentMinDate = new Date(
    minDateObj.getTime() + (timeRange[0] / 100) * (maxDateObj.getTime() - minDateObj.getTime()),
  )
  const currentMaxDate = new Date(
    minDateObj.getTime() + (timeRange[1] / 100) * (maxDateObj.getTime() - minDateObj.getTime()),
  )

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 md:p-6">
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="mb-6 bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> 戻る
      </Button>

      {/* Main Header */}
      <header className="mb-8 p-6 bg-gray-800/60 border border-gray-700 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-cyan-500">
              <AvatarImage
                src={entity.avatarUrl || `/placeholder.svg?width=80&height=80&query=${entity.entityType}`}
                alt={entity.name}
              />
              <AvatarFallback className="text-2xl bg-gray-700 text-gray-400">
                {entity.name ? entity.name.substring(0, 2) : "N/A"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {entity.name || "{Entity Name}"} (ID: {entity.id || "{entityId}"})
              </h1>
              {entity.partyName && (
                <Badge className="mt-1 bg-cyan-600/30 text-cyan-300 border-cyan-500/50 text-sm">
                  {entity.partyName}
                </Badge>
              )}
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-400">差引純資産</p>
            <p className="text-3xl md:text-4xl font-bold text-white">¥{Number(entity.netBalance).toLocaleString()}</p>
          </div>
        </div>
      </header>

      {/* Financial Network Graph (Full Width) */}
      <Card className="mb-8 bg-gray-800/60 border-gray-700 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <CardTitle className="text-xl text-white">資金ネットワーク</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-xs bg-gray-700 border-gray-600 hover:bg-gray-600">
                <ZoomIn className="h-3 w-3 mr-1" /> ズームイン
              </Button>
              <Button variant="outline" size="sm" className="text-xs bg-gray-700 border-gray-600 hover:bg-gray-600">
                <ZoomOut className="h-3 w-3 mr-1" /> ズームアウト
              </Button>
              <Button variant="outline" size="sm" className="text-xs bg-gray-700 border-gray-600 hover:bg-gray-600">
                <Download className="h-3 w-3 mr-1" /> エクスポート
              </Button>
            </div>
          </div>
          <CardDescription className="text-gray-400">資金の流れと関連性を視覚的に表示します。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 border border-gray-700 rounded-lg bg-gray-800 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex-1 min-w-[150px]">
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-300 text-xs">
                    <Filter className="h-3 w-3 mr-1.5 text-gray-400" />
                    <SelectValue placeholder="業界で絞り込み" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600 text-gray-300">
                    <SelectItem value="all" className="text-xs">
                      全ての業界
                    </SelectItem>
                    {networkData.industries?.map((ind) => (
                      <SelectItem key={ind} value={ind} className="text-xs">
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 w-full space-y-1">
                <div className="flex justify-between text-xs text-gray-400 px-1">
                  <CalendarDays className="h-3.5 w-3.5 mr-1 inline-block" />
                  <span>{currentMinDate.toLocaleDateString("ja-JP")}</span>
                  <span>{currentMaxDate.toLocaleDateString("ja-JP")}</span>
                </div>
                <Slider
                  value={timeRange}
                  onValueChange={(value) => setTimeRange(value as [number, number])}
                  min={0}
                  max={100}
                  step={1}
                  className="[&>span:first-child]:h-1 [&>span:first-child>span]:bg-cyan-500 [&>span:nth-child(n+2)>span]:bg-gray-500 [&>span:nth-child(n+2)]:bg-gray-300 [&>span:nth-child(n+2)]:h-3 [&>span:nth-child(n+2)]:w-3 [&>span:nth-child(n+2)]:border-2"
                />
              </div>
            </div>
          </div>
          <div className="w-full h-[350px] md:h-[450px] bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
            <p className="text-gray-500">インタラクティブなネットワークグラフ (プレースホルダー)</p>
          </div>
        </CardContent>
      </Card>

      {/* Balance Sheet Style Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Income */}
        <section className="space-y-6">
          <header className="pb-2 border-b border-gray-700">
            <h2 className="text-2xl font-semibold text-white flex items-center justify-between">
              <span>
                <TrendingUp className="inline-block mr-2 text-green-400" />
                収入の部
              </span>
              <span className="text-xl font-medium text-green-400">
                ¥{Number(summary.totalIncome).toLocaleString()}
              </span>
            </h2>
          </header>
          <Card className="bg-gray-800/60 border-gray-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-white">主な収入源</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="h-8 px-2 text-gray-400">ソース</TableHead>
                    <TableHead className="h-8 px-2 text-right text-gray-400">金額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.topIncomeSources.map((item, i) => (
                    <TableRow key={`top-income-${i}`} className="border-gray-700 hover:bg-gray-700/50">
                      <TableCell className="py-1.5 px-2">
                        <Link
                          href={`/explorer/${item.counterparty.type}/${item.counterparty.id}`}
                          className="text-cyan-400 hover:text-cyan-300 hover:underline"
                        >
                          {item.counterparty.name}
                        </Link>
                      </TableCell>
                      <TableCell className="py-1.5 px-2 text-right font-mono text-green-400/90">
                        ¥{Number(item.amount).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/60 border-gray-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-white">全収入トランザクション</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable
                columns={incomeTableColumns}
                data={incomeTransactions}
                filterColumn="counterparty.name"
                filterPlaceholder="ソース名で検索..."
              />
            </CardContent>
          </Card>
        </section>

        {/* Right Column: Expenditure */}
        <section className="space-y-6">
          <header className="pb-2 border-b border-gray-700">
            <h2 className="text-2xl font-semibold text-white flex items-center justify-between">
              <span>
                <TrendingDown className="inline-block mr-2 text-red-400" />
                支出の部
              </span>
              <span className="text-xl font-medium text-red-400">
                ¥{Number(summary.totalExpenditure).toLocaleString()}
              </span>
            </h2>
          </header>
          <Card className="bg-gray-800/60 border-gray-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-white">主な支出先</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="h-8 px-2 text-gray-400">ターゲット</TableHead>
                    <TableHead className="h-8 px-2 text-right text-gray-400">金額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.topExpenditureTargets.map((item, i) => (
                    <TableRow key={`top-exp-${i}`} className="border-gray-700 hover:bg-gray-700/50">
                      <TableCell className="py-1.5 px-2">
                        <Link
                          href={`/explorer/${item.counterparty.type}/${item.counterparty.id}`}
                          className="text-cyan-400 hover:text-cyan-300 hover:underline"
                        >
                          {item.counterparty.name}
                        </Link>
                      </TableCell>
                      <TableCell className="py-1.5 px-2 text-right font-mono text-red-400/90">
                        ¥{Number(item.amount).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/60 border-gray-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-white">全支出トランザクション</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable
                columns={expenditureTableColumns}
                data={expenditureTransactions}
                filterColumn="counterparty.name"
                filterPlaceholder="ターゲット名で検索..."
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
