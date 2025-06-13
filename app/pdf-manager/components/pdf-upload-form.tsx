"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

interface PdfUploadFormProps {
  onSuccess: () => void
}

export function PdfUploadForm({ onSuccess }: PdfUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) {
      toast({
        variant: "destructive",
        title: "ファイル未選択",
        description: "アップロードするPDFファイルを選択してください。",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("file", file)

    try {
      // Using XMLHttpRequest for progress, but fetch can be used if progress isn't critical
      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/pdf-manager/upload", true)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(percentComplete)
        }
      }

      xhr.onload = () => {
        setIsUploading(false)
        if (xhr.status === 201) {
          onSuccess()
          setFile(null)
          // Clear the file input if possible (difficult with controlled input)
          // Consider using a key prop on the input to reset it
          const fileInput = (event.target as HTMLFormElement).elements.namedItem("pdf-file") as HTMLInputElement
          if (fileInput) fileInput.value = ""
        } else {
          let errorMessage = "アップロードに失敗しました。"
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            errorMessage = errorResponse.error || errorResponse.message || errorMessage
          } catch (e) {
            // JSON parse error, use default message
          }
          toast({
            variant: "destructive",
            title: "アップロード失敗",
            description: errorMessage,
          })
        }
      }

      xhr.onerror = () => {
        setIsUploading(false)
        toast({
          variant: "destructive",
          title: "アップロードエラー",
          description: "ネットワークエラーまたはサーバーが応答しませんでした。",
        })
      }

      xhr.send(formData)
    } catch (error: any) {
      setIsUploading(false)
      toast({
        variant: "destructive",
        title: "アップロードエラー",
        description: error.message || "予期せぬエラーが発生しました。",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="pdf-file">PDFファイル</Label>
        <Input
          id="pdf-file"
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          disabled={isUploading}
        />
      </div>
      {isUploading && (
        <div className="space-y-1">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
        </div>
      )}
      <Button type="submit" disabled={isUploading || !file}>
        {isUploading ? "アップロード中..." : "アップロード"}
      </Button>
    </form>
  )
}
