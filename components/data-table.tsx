"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

// Helper to safely get nested values
const getNestedValue = (obj: any, path: string): any => {
  const keys = path.split(".")
  let value = obj
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k]
    } else {
      return undefined // Path not found or intermediate value not an object
    }
  }
  return value
}

interface Column {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
  href?: (row: any) => string
}

interface DataTableProps {
  title: string
  apiPath: string
  columns: Column[]
  pageSize?: number
  externalSearchTerm?: string
  onRowClick?: (row: any) => void
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function DataTable({
  title,
  apiPath,
  columns,
  pageSize = 20,
  externalSearchTerm = "",
  onRowClick,
}: DataTableProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // const [search, setSearch] = useState(""); // Internal search state removed
  const [page, setPage] = useState(1)
  const [sortColumn, setSortColumn] = useState(columns[0]?.key || "")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 0,
  })

  // Popover and commandInputValue states removed

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        search: externalSearchTerm, // Use externalSearchTerm
        sortColumn,
        sortOrder,
      })
      const response = await fetch(`${apiPath}?${params}`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
        setPagination(result.pagination)
      } else {
        setError(result.error || "データの取得に失敗しました")
      }
    } catch (err) {
      setError("ネットワークエラーが発生しました")
      console.error("Data fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, externalSearchTerm, sortColumn, sortOrder]) // Depend on externalSearchTerm

  // triggerSearch and suggestions logic removed

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(columnKey)
      setSortOrder("asc")
    }
    setPage(1) // Reset to page 1 on sort
  }

  // Reset page to 1 when externalSearchTerm changes
  useEffect(() => {
    setPage(1)
  }, [externalSearchTerm])

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "-"
    try {
      return new Date(dateString).toLocaleDateString("ja-JP")
    } catch (e) {
      return "-"
    }
  }

  const formatValue = (row: any, column: Column): React.ReactNode => {
    const cellValue = getNestedValue(row, column.key)

    if (column.render) {
      // Pass the resolved cellValue and the full row for context
      return column.render(cellValue, row)
    }

    // Use cellValue for further processing if no custom render function
    const displayValue = cellValue

    if (column.href) {
      const linkHref = column.href(row)
      let textForLink: string | number | undefined = displayValue

      if (typeof displayValue === "object" && displayValue !== null) {
        // console.warn(`DataTable: Column "${column.key}" for href resolved to an object. Using placeholder. Consider a 'render' function.`, displayValue);
        textForLink = "[Complex Object]" // Placeholder for objects in links
      } else if (displayValue === undefined || displayValue === null) {
        textForLink = "-"
      }

      const finalTextForLink =
        (column.key.includes("_on") || column.key.includes("date")) && typeof textForLink === "string"
          ? formatDate(textForLink)
          : String(textForLink) // Ensure it's a string for the Link child

      return (
        <Link href={linkHref} className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">
          {finalTextForLink}
        </Link>
      )
    }

    // Default rendering if no render and no href
    if (typeof displayValue === "object" && displayValue !== null) {
      // console.warn(`DataTable: Column "${column.key}" resolved to an object and has no custom renderer or href. Using placeholder.`, displayValue);
      return "[Object]" // Placeholder for direct object rendering
    }

    if (column.key.includes("_on") || column.key.includes("date")) {
      return formatDate(displayValue as string)
    }

    return displayValue === undefined || displayValue === null ? "-" : String(displayValue)
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="dark:bg-gray-800/30 dark:border-gray-700">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</CardTitle>
          {/* Search input UI removed from here */}
          <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-300">
            {pagination.total}件
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-gray-700">
                {columns.map((col) => (
                  <TableHead key={col.key} className="whitespace-nowrap dark:text-gray-400">
                    {col.sortable !== false ? (
                      <Button
                        variant="ghost"
                        onClick={() => handleSort(col.key)}
                        className="h-auto p-0 font-semibold hover:bg-transparent dark:text-gray-300 dark:hover:text-cyan-400"
                      >
                        {col.label}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="font-semibold dark:text-gray-300">{col.label}</span>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex} className="dark:border-gray-700">
                    {columns.map((col) => (
                      <TableCell key={col.key} className="dark:text-gray-300">
                        <Skeleton className="h-4 w-full bg-gray-300 dark:bg-gray-700" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow className="dark:border-gray-700">
                  <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    データが見つかりません
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, rowIndex) => (
                  <TableRow
                    key={row.id || rowIndex}
                    className={`dark:border-gray-700 ${onRowClick ? "cursor-pointer hover:dark:bg-gray-700/50" : "hover:dark:bg-gray-700/30"}`}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} className="whitespace-nowrap dark:text-gray-300">
                        {formatValue(row, col)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {pagination.total}件中 {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)}件を表示
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
                前へ
              </Button>
              <span className="text-sm dark:text-gray-300">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                次へ
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
