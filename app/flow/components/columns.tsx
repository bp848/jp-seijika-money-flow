"use client"

import type { ColumnDef } from "@tanstack/react-table"

export interface DisplayTransaction {
  id: number
  occurred_on: Date | null
  source_name: string | null
  target_name: string | null
  amount: number
  transaction_type: string | null
}

export const columns: ColumnDef<DisplayTransaction>[] = [
  {
    accessorKey: "occurred_on",
    header: "日付",
    cell: ({ row }) => {
      const date = row.getValue("occurred_on") as string | null
      return date ? new Date(date).toLocaleDateString() : "N/A"
    },
  },
  {
    accessorKey: "source_name",
    header: "支払元 (From)",
  },
  {
    accessorKey: "target_name",
    header: "支払先 (To)",
  },
  {
    accessorKey: "amount",
    header: "金額 (円)",
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("amount"))
      return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(amount)
    },
  },
  {
    accessorKey: "transaction_type",
    header: "目的/カテゴリ",
  },
]
