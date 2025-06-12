// app/(main)/politician-dashboard/[entityId]/page.tsx
"use client"

import { ArrowUpRight, ArrowDownRight, Flag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { EnhancedDataTable, type ColumnDef as EnhancedColumnDef } from "@/components/dashboard/enhanced-data-table" // To be created
import { TopDonorsWidget } from "@/components/dashboard/top-donors-widget" // To be created
import { TopRecipientsWidget } from "@/components/dashboard/top-recipients-widget" // To be created
import { RelatedEntitiesWidget } from "@/components/dashboard/related-entities-widget" // To be created
import { FundraisingPartyIncomeWidget } from "@/components/dashboard/fundraising-party-income-widget" // To be created

// Placeholder data types - replace with actual types from your project
interface PoliticianDetails {
  id: string
  name: string
  party: string
  position: string
  imageUrl?: string
  totalBalance: number
  balanceHistory: { date: string; balance: number }[]
}

interface Transaction {
  id: string
  date: string
  source_target: string // Source for income, Target for expenditure
  purpose?: string // For expenditure
  amount: number
  isFlagged?: boolean
  flagReason?: string
}

// Placeholder data - replace with actual data fetching
const mockPoliticianData: PoliticianDetails = {
  id: "123",
  name: "山田 太郎",
  party: "革新未来党",
  position: "代表",
  imageUrl: "/placeholder.svg?width=100&height=100",
  totalBalance: 15000000,
  balanceHistory: [
    { date: "2023-01", balance: 12000000 },
    { date: "2023-02", balance: 12500000 },
    { date: "2023-03", balance: 11800000 },
    { date: "2023-04", balance: 13000000 },
    { date: "2023-05", balance: 14000000 },
    { date: "2023-06", balance: 15000000 },
  ],
}

const mockIncomeTransactions: Transaction[] = [
  {
    id: "inc1",
    date: "2023-06-15",
    source_target: "株式会社A",
    amount: 1000000,
    isFlagged: true,
    flagReason: "Top 5% of all donations",
  },
  { id: "inc2", date: "2023-06-10", source_target: "支援団体B", amount: 500000 },
  { id: "inc3", date: "2023-05-20", source_target: "個人C", amount: 200000 },
  // ... more income transactions
]

const mockExpenditureTransactions: Transaction[] = [
  { id: "exp1", date: "2023-06-12", source_target: "印刷会社X", purpose: "広報物印刷費", amount: 300000 },
  {
    id: "exp2",
    date: "2023-06-05",
    source_target: "会場Y",
    purpose: "集会会場費",
    amount: 150000,
    isFlagged: true,
    flagReason: "Unusual expenditure pattern",
  },
  { id: "exp3", date: "2023-05-25", source_target: "交通費Z", purpose: "地方遊説交通費", amount: 80000 },
  // ... more expenditure transactions
]

const incomeColumns: EnhancedColumnDef<Transaction>[] = [
  {
    accessorKey: "isFlagged",
    header: () => <Flag className="h-4 w-4 text-muted-foreground" />,
    cell: ({ row }) => {
      const transaction = row.original
      if (transaction.isFlagged) {
        return (
          <div className="flex items-center justify-center">
            <Tooltip content={transaction.flagReason || "Flagged Transaction"}>
              <Flag className="h-5 w-5 text-red-500" />
            </Tooltip>
          </div>
        )
      }
      return null
    },
    size: 50,
  },
  { accessorKey: "date", header: "日付 (Date)" },
  { accessorKey: "source_target", header: "ソース (Source / Donor)" },
  {
    accessorKey: "amount",
    header: "金額 (Amount)",
    cell: ({ row }) => `¥${row.original.amount.toLocaleString()}`,
  },
]

const expenditureColumns: EnhancedColumnDef<Transaction>[] = [
  {
    accessorKey: "isFlagged",
    header: () => <Flag className="h-4 w-4 text-muted-foreground" />,
    cell: ({ row }) => {
      const transaction = row.original
      if (transaction.isFlagged) {
        return (
          <div className="flex items-center justify-center">
            <Tooltip content={transaction.flagReason || "Flagged Transaction"}>
              <Flag className="h-5 w-5 text-red-500" />
            </Tooltip>
          </div>
        )
      }
      return null
    },
    size: 50,
  },
  { accessorKey: "date", header: "日付 (Date)" },
  { accessorKey: "source_target", header: "ターゲット (Target / Recipient)" },
  { accessorKey: "purpose", header: "目的 (Purpose)" },
  {
    accessorKey: "amount",
    header: "金額 (Amount)",
    cell: ({ row }) => `¥${row.original.amount.toLocaleString()}`,
  },
]

export default function PoliticianDashboardPage({ params }: { params: { entityId: string } }) {
  // In a real app, fetch data based on params.entityId
  const politician = mockPoliticianData

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8 space-y-6">
      {/* Main Header Section - Assumed to be similar to existing */}
      <Card className="bg-gray-800/70 border-gray-700">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24 border-2 border-cyan-500">
            <AvatarImage src={politician.imageUrl || "/placeholder.svg"} alt={politician.name} />
            <AvatarFallback className="text-3xl bg-gray-700 text-gray-300">
              {politician.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-white">{politician.name}</h1>
            <p className="text-lg text-cyan-400">
              {politician.party} - {politician.position}
            </p>
            <Badge variant="outline" className="mt-2 border-gray-600 text-gray-300">
              ID: {politician.id}
            </Badge>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-400">現在の総残高</p>
            <p className="text-4xl font-bold text-white">¥{politician.totalBalance.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Balance History Chart (Full-width) */}
      <Card className="bg-gray-800/70 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-white">残高履歴 (Balance History)</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] md:h-[400px] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={politician.balanceHistory}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} stroke="#4A5568" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" tickFormatter={(value) => `¥${(value / 1000000).toLocaleString()}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.9)", borderColor: "#4A5568", color: "#E5E7EB" }}
                itemStyle={{ color: "#E5E7EB" }}
                formatter={(value: number) => [`¥${value.toLocaleString()}`, "残高"]}
              />
              <Legend wrapperStyle={{ color: "#E5E7EB" }} />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#2DD4BF"
                strokeWidth={2}
                dot={{ r: 4, fill: "#2DD4BF" }}
                activeDot={{ r: 6 }}
                name="残高"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Two-Column Layout for Income and Expenditure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: INCOME */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-8 w-8 text-green-400" />
            <h2 className="text-2xl font-semibold text-white">収入 (Income)</h2>
          </div>
          <FundraisingPartyIncomeWidget entityId={politician.id} />
          <TopDonorsWidget entityId={politician.id} />
          <Card className="bg-gray-800/70 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">全収入トランザクション (All Income Transactions)</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable
                columns={incomeColumns}
                data={mockIncomeTransactions} // Replace with actual fetched & filtered data
                filterColumn="source_target"
                filterPlaceholder="ドナー名で検索..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: EXPENDITURE */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <ArrowDownRight className="h-8 w-8 text-red-400" />
            <h2 className="text-2xl font-semibold text-white">支出 (Expenditure)</h2>
          </div>
          <RelatedEntitiesWidget entityId={politician.id} />
          <TopRecipientsWidget entityId={politician.id} />
          <Card className="bg-gray-800/70 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                全支出トランザクション (All Expenditure Transactions)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable
                columns={expenditureColumns}
                data={mockExpenditureTransactions} // Replace with actual fetched & filtered data
                filterColumn="source_target"
                filterPlaceholder="支出先名で検索..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Basic Tooltip component (can be replaced with Shadcn's Tooltip if available and configured)
// const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => (
//   <div className="relative group">
//     {children}
//     <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
//       {content}
//     </span>
//   </div>
// );
