"use client"

import useSWR from "swr"
import { supabase } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, ArrowRightLeftIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface FundFlow {
  id: string
  source_entity: string | null
  target_entity: string | null
  amount: number | null
  flow_date: string | null
}

export default function TransactionsList() {
  const fetcher = async (): Promise<FundFlow[]> => {
    const { data, error } = await supabase
      .from("fund_flows")
      .select("id, source_entity, target_entity, amount, flow_date")
      .order("flow_date", { ascending: false })
      .limit(100) // Reduced limit for initial display
    if (error) throw error
    return data || []
  }

  const { data: flows, error, isLoading, mutate } = useSWR<FundFlow[]>("transactions", fetcher)
  const router = useRouter()

  const renderContent = () => {
    if (isLoading) {
      return [...Array(7)].map((_, i) => (
        <TableRow key={i}>
          <TableCell className="py-2.5">
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell className="py-2.5">
            <Skeleton className="h-5 w-28" />
          </TableCell>
          <TableCell className="py-2.5">
            <Skeleton className="h-5 w-28" />
          </TableCell>
          <TableCell className="text-right py-2.5">
            <Skeleton className="h-5 w-16 ml-auto" />
          </TableCell>
        </TableRow>
      ))
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="py-2.5">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>資金移動データの取得に失敗しました。</span>
                <Button onClick={() => mutate()} variant="outline" size="sm" className="ml-2">
                  再試行
                </Button>
              </AlertDescription>
            </Alert>
          </TableCell>
        </TableRow>
      )
    }

    if (!flows || flows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-2.5">
            該当する資金移動データはありません。
          </TableCell>
        </TableRow>
      )
    }

    return flows.map((f) => (
      <TableRow
        key={f.id}
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => router.push(`/transaction/${f.id}`)}
      >
        <TableCell className="text-xs text-muted-foreground py-2.5">
          {f.flow_date ? new Date(f.flow_date).toLocaleDateString() : "-"}
        </TableCell>
        <TableCell className="text-sm py-2.5">{f.source_entity || "不明"}</TableCell>
        <TableCell className="text-sm py-2.5">{f.target_entity || "不明"}</TableCell>
        <TableCell className="text-sm text-right font-medium py-2.5">¥{f.amount?.toLocaleString() || "-"}</TableCell>
      </TableRow>
    ))
  }

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="flex items-center text-xl">
          <ArrowRightLeftIcon className="mr-2 h-5 w-5" />
          最新の資金移動 (上位100件)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] py-2">日付</TableHead>
                <TableHead className="py-2">送金元</TableHead>
                <TableHead className="py-2">送金先</TableHead>
                <TableHead className="text-right py-2">金額</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderContent()}</TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
