"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabaseClient"
import {
  Card,
  Title,
  Text,
  Metric,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Grid,
} from "@tremor/react"

// Type definitions
type Entity = {
  name: string | null
} | null

type Transaction = {
  id: number
  amount: number
  transaction_date: string
  purpose: string | null
  category: string | null
  flow_direction: "income" | "expenditure" | string | null
  source_entity: Entity
  target_entity: Entity
}

type Stats = {
  total_tx: number
  total_reports: number
  total_income: number
}

// Main dashboard component
export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<Stats>({ total_tx: 0, total_reports: 0, total_income: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      // Fetch transaction data
      const { data: txData, error: txError } = await supabase
        .from("fund_transactions")
        .select(`
                    id,
                    amount,
                    transaction_date,
                    purpose,
                    category,
                    flow_direction,
                    source_entity:source_entity_id ( name ),
                    target_entity:target_entity_id ( name )
                `)
        .order("id", { ascending: false })
        .limit(100)

      // Fetch stats
      const { count: txCount, error: txCountError } = await supabase
        .from("fund_transactions")
        .select("*", { count: "exact", head: true })

      const { count: reportCount, error: reportCountError } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })

      if (txError || txCountError || reportCountError) {
        console.error("Error fetching data:", txError || txCountError || reportCountError)
      } else {
        setTransactions(txData || [])
        const totalIncome = (txData || [])
          .filter((tx) => tx.flow_direction === "income")
          .reduce((sum, tx) => sum + tx.amount, 0)
        setStats({
          total_tx: txCount || 0,
          total_reports: reportCount || 0,
          total_income: totalIncome || 0,
        })
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="p-12 text-center">Loading data...</div>
  }

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>政治資金エクスプローラー</Title>
      <Text>日本の政治資金の流れを可視化するダッシュボード</Text>

      {/* ----- Summary Metrics ----- */}
      <Grid numItemsMd={2} numItemsLg={3} className="gap-6 mt-6">
        <Card>
          <Text>総トランザクション数</Text>
          <Metric>{stats.total_tx.toLocaleString()}</Metric>
        </Card>
        <Card>
          <Text>総報告書数</Text>
          <Metric>{stats.total_reports.toLocaleString()}</Metric>
        </Card>
        <Card>
          <Text>総収入額 (最新100件)</Text>
          <Metric>
            ¥
            {(stats.total_income / 100000000).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            億円
          </Metric>
        </Card>
      </Grid>

      {/* ----- Latest Transactions Table ----- */}
      <div className="mt-6">
        <Card>
          <Title>最新の資金トランザクション</Title>
          <Table className="mt-5">
            <TableHead>
              <TableRow>
                <TableHeaderCell>日付</TableHeaderCell>
                <TableHeaderCell className="text-right">金額 (円)</TableHeaderCell>
                <TableHeaderCell>支払元 (From)</TableHeaderCell>
                <TableHeaderCell>支払先 (To)</TableHeaderCell>
                <TableHeaderCell>カテゴリ</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.transaction_date}</TableCell>
                  <TableCell className="text-right">
                    <Text color={item.flow_direction === "income" ? "emerald" : "red"}>
                      {item.amount.toLocaleString()}
                    </Text>
                  </TableCell>
                  <TableCell>{item.source_entity?.name || "N/A"}</TableCell>
                  <TableCell>{item.target_entity?.name || "N/A"}</TableCell>
                  <TableCell>{item.category || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </main>
  )
}
