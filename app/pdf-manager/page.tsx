"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { PdfUploadForm } from "./components/pdf-upload-form"
import { columns, type PdfDocumentWithActions } from "./components/pdf-columns"
import { DataTable } from "./components/pdf-data-table"
import { useToast } from "@/components/ui/use-toast"
import type { PdfDocument, PdfDocumentStatus } from "@prisma/client"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PdfDocumentStatus as PrismaPdfDocumentStatus } from "@prisma/client"

interface ApiPdfDocument extends PdfDocument {
  // PrismaのPdfDocument型に合わせる。必要に応じて拡張。
}

interface FetchPdfsResponse {
  documents: ApiPdfDocument[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function PdfManagementPage() {
  const [data, setData] = useState<ApiPdfDocument[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const [pagination, setPagination] = useState({
    pageIndex: 0, // tanstack-table uses 0-based index
    pageSize: 10,
  })
  const [pageCount, setPageCount] = useState(0)
  const [totalRecords, setTotalRecords] = useState(0)

  const [fileNameFilter, setFileNameFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<PdfDocumentStatus | "all">("all")

  const fetchPdfs = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
        limit: pagination.pageSize.toString(),
      })
      if (fileNameFilter) params.append("name", fileNameFilter) // APIがnameフィルタをサポートしている場合
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/pdf-manager/documents?${params.toString()}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to fetch PDFs: ${response.statusText}`)
      }
      const result: FetchPdfsResponse = await response.json()
      setData(result.documents)
      setPageCount(result.pagination.totalPages)
      setTotalRecords(result.pagination.total)
    } catch (err: any) {
      setError(err.message)
      toast({
        variant: "destructive",
        title: "データ取得エラー",
        description: err.message,
      })
    } finally {
      setIsLoading(false)
    }
  }, [pagination, toast, fileNameFilter, statusFilter])

  useEffect(() => {
    fetchPdfs()
  }, [fetchPdfs])

  const handleUploadSuccess = () => {
    toast({
      title: "アップロード成功",
      description: "PDFファイルが正常にアップロードされました。",
    })
    fetchPdfs() // Refresh data after upload
  }

  const handleIndexPdf = async (documentId: string) => {
    try {
      const response = await fetch("/api/pdf-manager/documents/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentIds: [documentId] }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "インデックス作成リクエストに失敗しました。")
      }
      const result = await response.json()
      if (result.success && result.results?.[0]?.success) {
        toast({
          title: "インデックス作成開始",
          description: `ドキュメントID: ${documentId} のインデックス作成を開始しました。`,
        })
      } else {
        toast({
          variant: "destructive",
          title: "インデックス作成エラー",
          description: result.results?.[0]?.error || result.message || "インデックス作成に失敗しました。",
        })
      }
      fetchPdfs() // Refresh data to show status changes
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "インデックス作成エラー",
        description: err.message,
      })
    }
  }

  const tableData = useMemo((): PdfDocumentWithActions[] => {
    return data.map((doc) => ({
      ...doc,
      onIndex: () => handleIndexPdf(doc.id),
    }))
  }, [data])

  const allStatuses = useMemo(() => ["all", ...Object.values(PrismaPdfDocumentStatus)], [])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">PDF管理システム</h1>

      <div className="mb-8 p-6 border rounded-lg shadow-sm bg-card">
        <h2 className="text-xl font-semibold mb-4">PDFアップロード</h2>
        <PdfUploadForm onSuccess={handleUploadSuccess} />
      </div>

      <div className="mb-4 flex space-x-4">
        <Input
          placeholder="ファイル名でフィルタ..."
          value={fileNameFilter}
          onChange={(event) => setFileNameFilter(event.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PdfDocumentStatus | "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="ステータスでフィルタ" />
          </SelectTrigger>
          <SelectContent>
            {allStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "全てのステータス" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-red-500 mb-4">エラー: {error}</p>}

      <DataTable
        columns={columns}
        data={tableData}
        isLoading={isLoading}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pageCount}
        totalRecords={totalRecords}
      />
    </div>
  )
}
