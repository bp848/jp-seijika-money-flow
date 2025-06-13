"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, BadgeDollarSign, Landmark, User, Building, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { TransactionSummary } from "@/app/api/relationship-explorer/route" // Assuming this type is exported

const EntityTypeIcon = ({ type }: { type: string | undefined | null }) => {
  switch (type?.toLowerCase()) {
    case "politician":
      return <User className="mr-2 h-4 w-4 text-red-500" />
    case "organization":
      return <Landmark className="mr-2 h-4 w-4 text-blue-500" />
    case "fund_management_organization":
      return <Users className="mr-2 h-4 w-4 text-purple-500" />
    case "company":
      return <Building className="mr-2 h-4 w-4 text-amber-500" />
    default:
      return <BadgeDollarSign className="mr-2 h-4 w-4 text-gray-500" />
  }
}

export const incomeTransactionColumns: ColumnDef<TransactionSummary>[] = [
  {
    accessorKey: "source_name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          支払元
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const type = row.original.source_type
      return (
        <div className="flex items-center">
          <EntityTypeIcon type={type} />
          {row.getValue("source_name") || "不明"}
        </div>
      )
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-right w-full justify-end"
        >
          金額 (円)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("ja-JP", {
        style: "currency",
        currency: "JPY",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "transaction_date",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          日付
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("transaction_date") as string | Date | null
      if (!date) return "N/A"
      return new Date(date).toLocaleDateString("ja-JP")
    },
  },
  {
    accessorKey: "transaction_type",
    header: "取引種別",
    cell: ({ row }) => {
      const type = row.getValue("transaction_type") as string
      return <Badge variant="outline">{type || "不明"}</Badge>
    },
  },
  {
    accessorKey: "description",
    header: "摘要",
    cell: ({ row }) => <div className="truncate max-w-xs">{(row.getValue("description") as string) || "-"}</div>,
  },
]

export const expenditureTransactionColumns: ColumnDef<TransactionSummary>[] = [
  {
    accessorKey: "target_name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          支払先
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const type = row.original.target_type
      return (
        <div className="flex items-center">
          <EntityTypeIcon type={type} />
          {row.getValue("target_name") || "不明"}
        </div>
      )
    },
  },
  {
    accessorKey: "amount", // Same as income
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-right w-full justify-end"
        >
          金額 (円)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("ja-JP", {
        style: "currency",
        currency: "JPY",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "transaction_date", // Same as income
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          日付
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("transaction_date") as string | Date | null
      if (!date) return "N/A"
      return new Date(date).toLocaleDateString("ja-JP")
    },
  },
  {
    accessorKey: "transaction_type", // Same as income
    header: "取引種別",
    cell: ({ row }) => {
      const type = row.getValue("transaction_type") as string
      return <Badge variant="outline">{type || "不明"}</Badge>
    },
  },
  {
    accessorKey: "description", // Same as income
    header: "摘要",
    cell: ({ row }) => <div className="truncate max-w-xs">{(row.getValue("description") as string) || "-"}</div>,
  },
]
