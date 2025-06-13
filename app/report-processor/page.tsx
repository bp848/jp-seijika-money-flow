"use client"

import { useState, useTransition } from "react"
import { processReport } from "./actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

export default function ReportProcessorPage() {
  const [ocrText, setOcrText] = useState("")
  const [reportId, setReportId] = useState("")
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any; error?: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    if (!ocrText.trim()) {
      setResult({ success: false, message: "OCRテキストを入力してください。" })
      return
    }
    if (!reportId.trim()) {
      setResult({
        success: false,
        message: "レポートIDを入力してください。これはこの報告書を一意に識別するためのIDです（例: 2023_団体名）。",
      })
      return
    }
    startTransition(async () => {
      setResult(null) // Reset previous result
      const response = await processReport(ocrText, reportId)
      setResult(response)
    })
  }

  return (
    <div className="container mx-auto p-4 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>政治資金収支報告書処理</CardTitle>
          <CardDescription>OCR処理済みのテキストを貼り付け、Groqで解析しSupabaseに保存します。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="reportId">レポートID</Label>
            <Input
              id="reportId"
              placeholder="例: 2023_自由民衆党 (一意のID)"
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
              disabled={isPending}
            />
            <p className="text-sm text-muted-foreground">
              この報告書をデータベース内で一意に識別するためのIDを入力してください。
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ocrText">OCR処理済みテキスト</Label>
            <Textarea
              id="ocrText"
              placeholder="ここにOCR処理済みの政治資金収支報告書のテキストを貼り付けてください..."
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              rows={15}
              className="min-h-[300px]"
              disabled={isPending}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4">
          <Button onClick={handleSubmit} disabled={isPending || !ocrText.trim() || !reportId.trim()}>
            {isPending ? "処理中..." : "処理実行"}
          </Button>
          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              <Terminal className="h-4 w-4" />
              <AlertTitle>{result.success ? "成功" : "エラー"}</AlertTitle>
              <AlertDescription>
                {result.message}
                {result.error && (
                  <pre className="mt-2 w-full whitespace-pre-wrap break-all rounded-md bg-slate-950 p-4 text-xs text-slate-50">
                    {result.error}
                  </pre>
                )}
                {result.data && result.success && (
                  <details className="mt-2">
                    <summary>処理結果詳細 (JSON)</summary>
                    <pre className="mt-2 w-full whitespace-pre-wrap break-all rounded-md bg-slate-950 p-4 text-xs text-slate-50">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
