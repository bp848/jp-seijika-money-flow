"use client"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Transaction } from "@/types"
import { cn } from "@/lib/utils"

interface TimelineViewProps {
  transactions: Transaction[]
  onSelectTransaction: (transaction: Transaction) => void
}

export default function TimelineView({ transactions, onSelectTransaction }: TimelineViewProps) {
  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const startDate = new Date(sortedTransactions[0].date)
  const endDate = new Date(sortedTransactions[sortedTransactions.length - 1].date)
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)

  const maxAmount = Math.max(...transactions.map((t) => t.amount))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>資金トランザクションタイムライン</CardTitle>
        <CardDescription>資金の出入りを時系列で表示します。バーをクリックすると詳細を確認できます。</CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100%-100px)]">
        <ScrollArea className="w-full h-full whitespace-nowrap">
          <div className="relative h-full w-[2000px] border-t border-gray-200 dark:border-gray-700">
            {/* Center Line */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-gray-300 dark:bg-gray-600" />

            {sortedTransactions.map((tx) => {
              const dayDiff = (new Date(tx.date).getTime() - startDate.getTime()) / (1000 * 3600 * 24)
              const leftPosition = (dayDiff / totalDays) * 100
              const barHeight = (tx.amount / maxAmount) * 40 // 40% of half height

              return (
                <div
                  key={tx.id}
                  className="absolute group cursor-pointer"
                  style={{
                    left: `${leftPosition}%`,
                    bottom: tx.type === "expense" ? "50%" : `calc(50% - ${barHeight}%)`,
                    height: `${barHeight}%`,
                  }}
                  onClick={() => onSelectTransaction(tx)}
                >
                  <div
                    className={cn(
                      "w-2 rounded-t-md transition-all duration-200 group-hover:opacity-100",
                      tx.type === "income" ? "bg-green-500 hover:bg-green-400" : "bg-red-500 hover:bg-red-400",
                      tx.type === "expense" && "transform -scale-y-100 origin-bottom",
                    )}
                    style={{ height: "100%" }}
                  />
                  <div className="absolute bottom-full mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <p className="font-bold">{new Date(tx.date).toLocaleDateString()}</p>
                    <p>
                      {tx.type === "income" ? "From" : "To"}: {tx.type === "income" ? tx.from : tx.to}
                    </p>
                    <p className="font-semibold">¥{tx.amount.toLocaleString()}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
