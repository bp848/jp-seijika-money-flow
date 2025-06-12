"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowRightLeft, Download, Users, TrendingUp, TrendingDown, BarChart, ListFilter } from "lucide-react"
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts" // Placeholder for chart

// Placeholder data - replace with actual data fetching and types
interface Transaction {
  id: string
  occurred_on: string
  source: string
  target: string
  amount: number
  type: "donation" | "expense"
}

interface TopFlow {
  partner: string
  flowType: "Incoming" | "Outgoing"
  totalAmount: number
}

interface TopHolder {
  entityName: string
  amount: number
  percentage: string
}

const entityData = {
  name: "岸田 文雄",
  net_balance: 123456789,
  avatarUrl: "/placeholder-user.jpg", // Replace with actual avatar URL or logic
  summary: {
    totalIncome: 250000000,
    totalExpenditure: 126543211,
    totalTransactions: 1250,
  },
  balanceHistory: [
    { name: "Jan", balance: 50000000 },
    { name: "Feb", balance: 65000000 },
    { name: "Mar", balance: 60000000 },
    { name: "Apr", balance: 75000000 },
    { name: "May", balance: 90000000 },
    { name: "Jun", balance: 123456789 },
  ],
  topFlows: [
    { partner: "株式会社A建設", flowType: "Outgoing", totalAmount: 5000000 },
    { partner: "Bコンサルティング", flowType: "Outgoing", totalAmount: 3000000 },
    { partner: "支援団体C", flowType: "Incoming", totalAmount: 10000000 },
    { partner: "個人献金D", flowType: "Incoming", totalAmount: 2000000 },
  ] as TopFlow[],
  allTransactions: [
    { id: "1", occurred_on: "2023-05-15", source: "支援団体C", target: "岸田 文雄", amount: 5000000, type: "donation" },
    {
      id: "2",
      occurred_on: "2023-05-20",
      source: "岸田 文雄",
      target: "株式会社A建設",
      amount: 2000000,
      type: "expense",
    },
    { id: "3", occurred_on: "2023-06-01", source: "個人献金D", target: "岸田 文雄", amount: 1000000, type: "donation" },
    // ... more transactions
  ] as Transaction[],
  topHolders: [
    // Assuming "holders" means top contributors/recipients
    { entityName: "支援団体C", amount: 10000000, percentage: "20%" },
    { entityName: "株式会社X", amount: 8000000, percentage: "16%" },
    { entityName: "個人献金D", amount: 5000000, percentage: "10%" },
  ] as TopHolder[],
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(amount)
}

export default function ExplorerPage() {
  // TODO: Fetch actual entity data based on ID from params or context
  const entity = entityData

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* A. Header Section */}
      <Card className="bg-card/50 backdrop-blur-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <Avatar className="h-20 w-20 md:h-28 md:w-28 border-2 border-primary">
              <AvatarImage src={entity.avatarUrl || "/placeholder.svg"} alt={entity.name} />
              <AvatarFallback>{entity.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold">{entity.name}</h1>
              <p className="text-2xl md:text-3xl text-muted-foreground font-semibold">
                {formatCurrency(entity.net_balance)}
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                ネットワークの視覚化
              </Button>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <Download className="mr-2 h-4 w-4" />
                データのエクスポート
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* B. Main Content Grid (2-column layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Top Flows Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <TrendingDown className="h-5 w-5 text-red-500" />
                トップフロー
              </CardTitle>
              <CardDescription>主要な資金の流入・流出先</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>取引相手</TableHead>
                    <TableHead>フロータイプ</TableHead>
                    <TableHead className="text-right">合計金額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entity.topFlows.map((flow, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{flow.partner}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            flow.flowType === "Incoming"
                              ? "bg-green-500/20 text-green-500"
                              : "bg-red-500/20 text-red-500"
                          }`}
                        >
                          {flow.flowType === "Incoming" ? "収入" : "支出"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(flow.totalAmount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* All Transactions Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListFilter className="h-5 w-5" />
                全トランザクション
              </CardTitle>
              <CardDescription>全資金移動の詳細リスト。フィルターやソートが可能です。</CardDescription>
              {/* TODO: Add filter controls here if needed */}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>ソース</TableHead>
                    <TableHead>ターゲット</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entity.allTransactions.slice(0, 5).map(
                    (
                      tx, // Displaying first 5 for brevity
                    ) => (
                      <TableRow key={tx.id}>
                        <TableCell>{tx.occurred_on}</TableCell>
                        <TableCell className="font-medium">{tx.source}</TableCell>
                        <TableCell className="font-medium">{tx.target}</TableCell>
                        <TableCell
                          className={`text-right font-semibold ${tx.type === "donation" ? "text-green-500" : "text-red-500"}`}
                        >
                          {tx.type === "donation" ? "+" : "-"} {formatCurrency(tx.amount)}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
              {/* TODO: Add pagination controls here */}
              <div className="mt-4 flex justify-end">
                <Button variant="outline">さらに表示</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Summary Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                概要
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">総収入</span>
                <span className="font-semibold text-green-500">{formatCurrency(entity.summary.totalIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">総支出</span>
                <span className="font-semibold text-red-500">{formatCurrency(entity.summary.totalExpenditure)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">総取引数</span>
                <span className="font-semibold">{entity.summary.totalTransactions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">差引純資産</span>
                <span className="font-semibold">{formatCurrency(entity.net_balance)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Balance History Chart */}
          <Card>
            <CardHeader>
              <CardTitle>残高履歴</CardTitle>
              <div className="flex gap-1 mt-2">
                <Button size="sm" variant="ghost" className="text-xs">
                  1ヶ月
                </Button>
                <Button size="sm" variant="ghost" className="text-xs">
                  1年
                </Button>
                <Button size="sm" variant="secondary" className="text-xs">
                  すべて
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-[250px] p-0">
              {/* Placeholder for Recharts line graph */}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={entity.balanceHistory} margin={{ top: 5, right: 20, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${value / 1000000}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      borderColor: "hsl(var(--border))",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Line type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Holders Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                トップホルダー
              </CardTitle>
              <CardDescription>主要な資金提供者・受領者</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>エンティティ名</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                    <TableHead className="text-right">割合</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entity.topHolders.map((holder, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{holder.entityName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(holder.amount)}</TableCell>
                      <TableCell className="text-right">{holder.percentage}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
