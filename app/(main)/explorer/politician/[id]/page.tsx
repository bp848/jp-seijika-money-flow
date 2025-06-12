// This is the new path for the dynamic page
// Renaming from app/(main)/explorer/[entityType]/[entityId]/page.tsx
// to be specific for politicians as a starting point.
"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react"
import { EnhancedDataTable, type EnhancedColumnDef } from "@/components/dashboard/enhanced-data-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Simplified types for this specific page
type EntityType = "politician" | "party" | "branch" | "fund-group" | "corporate" | "individual" | "unknown"

interface CounterpartyLink {
  id: string
  name: string
  type: EntityType
}

interface Transaction {
  id: string
  date: string
  counterparty: CounterpartyLink
  purpose: string
  type: "income" | "expense"
  amount: number
}

interface PoliticianDashboardData {
  politician: {
    id: string
    name: string
    partyName?: string
    avatarUrl?: string
  }
  summary: {
    totalIncome: number
    totalExpenditure: number
    netBalance: number
  }
  transactions: Transaction[]
}

// MOCK API FUNCTION - This simulates the API you will build
const fetchKoyukaiDashboardData = async (politicianId: string): Promise<PoliticianDashboardData> => {
  // In a real app, you'd fetch from `/api/explorer/politician/${politicianId}`
  await new Promise((resolve) => setTimeout(resolve, 500))

  // This mock data perfectly mirrors the `koyukai_report.pdf` content
  return {
    politician: {
      id: "1", // Corresponds to 渡邊 孝一's ID in the seed script
      name: "渡邊 孝一",
      partyName: "自由民主党",
      avatarUrl: "/placeholder-user.jpg",
    },
    summary: {
      totalIncome: 370086,
      totalExpenditure: 275265,
      netBalance: 94821,
    },
    transactions: [
      // Income
      {
        id: "tx-income-1",
        date: "2023-12-31",
        counterparty: { id: "3", name: "不明な政治団体", type: "unknown" },
        purpose: "政治団体からの寄附",
        type: "income",
        amount: 350000,
      },
      // Expenditures
      {
        id: "tx-exp-1",
        date: "2023-01-10",
        counterparty: { id: "2", name: "(株)ジェーシービー", type: "corporate" },
        purpose: "ETCカード代金支払い",
        type: "expense",
        amount: 14840,
      },
      {
        id: "tx-exp-2",
        date: "2023-02-10",
        counterparty: { id: "2", name: "(株)ジェーシービー", type: "corporate" },
        purpose: "ETCカード代金支払い",
        type: "expense",
        amount: 17260,
      },
      {
        id: "tx-exp-3",
        date: "2023-03-10",
        counterparty: { id: "2", name: "(株)ジェーシービー", type: "corporate" },
        purpose: "ETCカード代金支払い",
        type: "expense",
        amount: 25110,
      },
      {
        id: "tx-exp-4",
        date: "2023-04-10",
        counterparty: { id: "2", name: "(株)ジェーシービー", type: "corporate" },
        purpose: "ETCカード代金支払い",
        type: "expense",
        amount: 23950,
      },
      {
        id: "tx-exp-5",
        date: "2023-05-10",
        counterparty: { id: "2", name: "(株)ジェーシービー", type: "corporate" },
        purpose: "ETCカード代金支払い",
        type: "expense",
        amount: 24630,
      },
      {
        id: "tx-exp-6",
        date: "2023-06-12",
        counterparty: { id: "2", name: "(株)ジェーシービー", type: "corporate" },
        purpose: "ETCカード代金支払い",
        type: "expense",
        amount: 36070,
      },
      {
        id: "tx-exp-7",
        date: "2023-07-10",
        counterparty: { id: "2", name: "(株)ジェーシービー", type: "corporate" },
        purpose: "ETCカード代金支払い",
        type: "expense",
        amount: 13300,
      },
      {
        id: "tx-exp-8",
        date: "2023-08-10",
        counterparty: { id: "2", name: "(株)ジェーシービー", type: "corporate" },
        purpose: "ETCカード代金支払い",
        type: "expense",
        amount: 21360,
      },
      {
        id: "tx-exp-9",
        date: "2023-09-11",
        counterparty: { id: "2", name: "(株)ジェーシービー", type: "corporate" },
        purpose: "ETCカード代金支払い",
        type: "expense",
        amount: 28690,
      },
      {
        id: "tx-exp-10",
        date: "2023-10-10",
        counterparty: { id: "2", name: "(株)ジェーシービー", type: "corporate" },
        purpose: "ETCカード代金支払い",
        type: "expense",
        amount: 44510,
      },
      {
        id: "tx-exp-11",
        date: "2023-11-10",
        counterparty: { id: "2", name: "(株)ジェーシービー", type: "corporate" },
        purpose: "ETCカード代金支払い",
        type: "expense",
        amount: 10410,
      },
      {
        id: "tx-exp-12",
        date: "2023-12-11",
        counterparty: { id: "2", name: "(株)ジェーシービー", type: "corporate" },
        purpose: "ETCカード代金支払い",
        type: "expense",
        amount: 15135,
      },
    ],
  }
}

// The main dashboard page component
export default function PoliticianExplorerDashboard() {
  const params = useParams()
  const router = useRouter()
  const politicianId = params.id as string

  const [dashboardData, setDashboardData] = useState<PoliticianDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (politicianId) {
      setLoading(true)
      fetchKoyukaiDashboardData(politicianId)
        .then(setDashboardData)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [politicianId])

  const { incomeTransactions, expenditureTransactions, topIncomeSources, topExpenditureTargets } = useMemo(() => {
    if (!dashboardData) {
      return {
        incomeTransactions: [],
        expenditureTransactions: [],
        topIncomeSources: [],
        topExpenditureTargets: [],
      }
    }
    const income = dashboardData.transactions.filter((tx) => tx.type === "income")
    const expenditure = dashboardData.transactions.filter((tx) => tx.type === "expense")
    const topIncome = [...income].sort((a, b) => b.amount - a.amount).slice(0, 5)
    const topExpenditure = [...expenditure].sort((a, b) => b.amount - a.amount).slice(0, 5)
    return {
      incomeTransactions: income,
      expenditureTransactions: expenditure,
      topIncomeSources: topIncome,
      topExpenditureTargets: topExpenditure,
    }
  }, [dashboardData])

  // ... (Column definitions remain the same as previous version)
  const incomeTableColumns: EnhancedColumnDef<Transaction>[] = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "日付",
        cell: ({ row }) => new Date(row.original.date).toLocaleDateString("ja-JP"),
      },
      {
        accessorKey: "counterparty.name",
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
        accessorKey: "counterparty.name",
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

  if (loading) {
    // You can use a more sophisticated skeleton loader here
    return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">読み込み中...</div>
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        データが見つかりません。
      </div>
    )
  }

  const { politician, summary } = dashboardData

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 md:p-6">
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="mb-6 bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> 戻る
      </Button>

      {/* Header */}
      <header className="mb-8 p-6 bg-gray-800/60 border border-gray-700 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-cyan-500">
              <AvatarImage src={politician.avatarUrl || "/placeholder.svg"} alt={politician.name} />
              <AvatarFallback className="text-2xl bg-gray-700 text-gray-400">
                {politician.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {politician.name} (ID: {politician.id})
              </h1>
              {politician.partyName && (
                <Badge className="mt-1 bg-cyan-600/30 text-cyan-300 border-cyan-500/50 text-sm">
                  {politician.partyName}
                </Badge>
              )}
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-400">差引純資産</p>
            <p className="text-3xl md:text-4xl font-bold text-white">¥{summary.netBalance.toLocaleString()}</p>
          </div>
        </div>
      </header>

      {/* Network Graph */}
      <Card className="mb-8 bg-gray-800/60 border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-white">資金ネットワーク</CardTitle>
          <CardDescription className="text-gray-400">「孝友会」を中心とした資金の流れ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[350px] bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
            <p className="text-gray-500">
              ネットワークグラフ: 「不明な政治団体」 → 「孝友会」 → 「(株)ジェーシービー」
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Balance Sheet Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income */}
        <section className="space-y-6">
          <header className="pb-2 border-b border-gray-700">
            <h2 className="text-2xl font-semibold text-white flex items-center justify-between">
              <span>
                <TrendingUp className="inline-block mr-2 text-green-400" />
                収入の部
              </span>
              <span className="text-xl font-medium text-green-400">¥{summary.totalIncome.toLocaleString()}</span>
            </h2>
          </header>
          <Card className="bg-gray-800/60 border-gray-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-white">主な収入源</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="h-8 px-2 text-gray-400">ソース</TableHead>
                    <TableHead className="h-8 px-2 text-right text-gray-400">金額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topIncomeSources.map((item) => (
                    <TableRow key={item.id} className="border-gray-700 hover:bg-gray-700/50">
                      <TableCell className="py-1.5 px-2">
                        <Link
                          href={`/explorer/${item.counterparty.type}/${item.counterparty.id}`}
                          className="text-cyan-400 hover:text-cyan-300 hover:underline"
                        >
                          {item.counterparty.name}
                        </Link>
                      </TableCell>
                      <TableCell className="py-1.5 px-2 text-right font-mono text-green-400/90">
                        ¥{item.amount.toLocaleString()}
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
              <EnhancedDataTable columns={incomeTableColumns} data={incomeTransactions} />
            </CardContent>
          </Card>
        </section>

        {/* Expenditure */}
        <section className="space-y-6">
          <header className="pb-2 border-b border-gray-700">
            <h2 className="text-2xl font-semibold text-white flex items-center justify-between">
              <span>
                <TrendingDown className="inline-block mr-2 text-red-400" />
                支出の部
              </span>
              <span className="text-xl font-medium text-red-400">¥{summary.totalExpenditure.toLocaleString()}</span>
            </h2>
          </header>
          <Card className="bg-gray-800/60 border-gray-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-white">主な支出先</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="h-8 px-2 text-gray-400">ターゲット</TableHead>
                    <TableHead className="h-8 px-2 text-right text-gray-400">金額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topExpenditureTargets.map((item) => (
                    <TableRow key={item.id} className="border-gray-700 hover:bg-gray-700/50">
                      <TableCell className="py-1.5 px-2">
                        <Link
                          href={`/explorer/${item.counterparty.type}/${item.counterparty.id}`}
                          className="text-cyan-400 hover:text-cyan-300 hover:underline"
                        >
                          {item.counterparty.name}
                        </Link>
                      </TableCell>
                      <TableCell className="py-1.5 px-2 text-right font-mono text-red-400/90">
                        ¥{item.amount.toLocaleString()}
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
              <EnhancedDataTable columns={expenditureTableColumns} data={expenditureTransactions} />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
