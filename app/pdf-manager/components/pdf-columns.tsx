"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { PdfDocument, PdfDocumentStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export interface PdfDocumentWithActions extends PdfDocument {
  onIndex: () => void
  // onDelete: () => void; // Future: for delete action
}

const getStatusVariant = (
  status: PdfDocumentStatus | null | undefined,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "completed":
      return "default" // Greenish in shadcn default theme
    case "pending_upload":
    case "text_extraction_processing":
    case "indexing_queued":
    case "indexing_processing":
      return "secondary" // Bluish/Grayish
    case "text_extraction_failed":
    case "indexing_failed":
    case "duplicate":
      return "destructive" // Reddish
    default:
      return "outline"
  }
}

export const columns: ColumnDef<PdfDocumentWithActions>[] = [
  // { // For future bulk actions
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={table.getIsAllPageRowsSelected()}
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "file_name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          ファイル名
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="truncate max-w-xs">{row.getValue("file_name")}</div>,
  },
  {
    accessorKey: "status",
    header: "ステータス",
    cell: ({ row }) => {
      const status = row.getValue("status") as PdfDocumentStatus
      return <Badge variant={getStatusVariant(status)}>{status || "N/A"}</Badge>
    },
  },
  {
    accessorKey: "upload_datetime",
    header: "アップロード日時",
    cell: ({ row }) => {
      const date = row.getValue("upload_datetime") as string | null
      return date ? new Date(date).toLocaleString() : "N/A"
    },
  },
  {
    accessorKey: "party_name",
    header: "政党名",
  },
  {
    accessorKey: "region",
    header: "地域",
  },
  {
    accessorKey: "file_size",
    header: "サイズ (KB)",
    cell: ({ row }) => {
      const size = row.getValue("file_size") as number | null
      return size ? (size / 1024).toFixed(2) : "N/A"
    },
  },
  {
    accessorKey: "file_hash",
    header: "ファイルハッシュ",
    cell: ({ row }) => (
      <div className="truncate font-mono text-xs max-w-[100px]">{row.getValue("file_hash") || "N/A"}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const doc = row.original
      const canIndex =
        doc.status !== "completed" &&
        doc.status !== "indexing_processing" &&
        doc.status !== "indexing_queued" &&
        doc.status !== "duplicate"

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">アクションを開く</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>アクション</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(doc.id)}>
              ドキュメントIDコピー
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => doc.onIndex()} disabled={!canIndex}>
              インデックス作成
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.open(doc.blob_url, "_blank")} disabled={!doc.blob_url}>
              ファイルを開く
            </DropdownMenuItem>
            {/* <DropdownMenuItem disabled>削除 (未実装)</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
