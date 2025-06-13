// components/dashboard/top-donors-widget.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

interface Donor {
  id: string
  counterparty: string
  totalAmount: number
  percentage: number
}

// Placeholder data - replace with actual data fetching logic
const fetchTopDonors = async (entityId: string): Promise<Donor[]> => {
  console.log(`Fetching top donors for ${entityId}`)
  await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call
  return [
    { id: "donor1", counterparty: "未来技術株式会社", totalAmount: 5000000, percentage: 33.3 },
    { id: "donor2", counterparty: "グリーンエネルギー財団", totalAmount: 3000000, percentage: 20.0 },
    { id: "donor3", counterparty: "山田建設グループ", totalAmount: 2000000, percentage: 13.3 },
    { id: "donor4", counterparty: "全国商工連盟", totalAmount: 1500000, percentage: 10.0 },
    { id: "donor5", counterparty: "匿名希望A", totalAmount: 1000000, percentage: 6.7 },
  ]
}

export function TopDonorsWidget({ entityId }: { entityId: string }) {
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopDonors(entityId).then((data) => {
      setDonors(data)
      setLoading(false)
    })
  }, [entityId])

  if (loading) {
    return (
      <Card className="bg-gray-800/70 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-white">トップドナー (Top Donors)</CardTitle>
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
        <CardTitle className="text-xl text-white">トップドナー (Top Donors)</CardTitle>
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
            {donors.map((donor) => (
              <TableRow key={donor.id} className="border-gray-700 hover:bg-gray-700/30">
                <TableCell className="font-medium text-gray-200">{donor.counterparty}</TableCell>
                <TableCell className="text-right text-gray-200">¥{donor.totalAmount.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/50">
                    {donor.percentage.toFixed(1)}%
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
