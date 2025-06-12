// components/dashboard/top-recipients-widget.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

interface Recipient {
  id: string
  counterparty: string
  totalAmount: number
  percentage: number
}

// Placeholder data - replace with actual data fetching logic
const fetchTopRecipients = async (entityId: string): Promise<Recipient[]> => {
  console.log(`Fetching top recipients for ${entityId}`)
  await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call
  return [
    { id: "rec1", counterparty: "政策研究センター", totalAmount: 2500000, percentage: 25.0 },
    { id: "rec2", counterparty: "選挙事務所運営費", totalAmount: 2000000, percentage: 20.0 },
    { id: "rec3", counterparty: "広報コンサルティング株式会社", totalAmount: 1500000, percentage: 15.0 },
    { id: "rec4", counterparty: "交通・宿泊費", totalAmount: 1000000, percentage: 10.0 },
    { id: "rec5", counterparty: "イベント企画会社Z", totalAmount: 800000, percentage: 8.0 },
  ]
}

export function TopRecipientsWidget({ entityId }: { entityId: string }) {
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopRecipients(entityId).then((data) => {
      setRecipients(data)
      setLoading(false)
    })
  }, [entityId])

  if (loading) {
    return (
      <Card className="bg-gray-800/70 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-white">主な支出先 (Top Recipients)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-700 rounded animate-pulse" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800/70 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl text-white">主な支出先 (Top Recipients)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700 hover:bg-gray-700/30">
              <TableHead className="text-gray-400">取引相手</TableHead>
              <TableHead className="text-right text-gray-400">合計金額</TableHead>
              <TableHead className="text-right text-gray-400">割合</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipients.map((recipient) => (
              <TableRow key={recipient.id} className="border-gray-700 hover:bg-gray-700/30">
                <TableCell className="font-medium text-gray-200">{recipient.counterparty}</TableCell>
                <TableCell className="text-right text-gray-200">¥{recipient.totalAmount.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/50">
                    {recipient.percentage.toFixed(1)}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
