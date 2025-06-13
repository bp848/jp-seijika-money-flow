import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: "ファイルが提供されていません" }, { status: 400 })
    }

    const filename = file.name
    const fileBuffer = await file.arrayBuffer()
    const uniqueFilename = `${uuidv4()}-${filename}`

    let blob
    try {
      blob = await put(uniqueFilename, fileBuffer, {
        access: "public",
        contentType: file.type,
      })
    } catch (storageError: any) {
      console.error("Vercel Blob put error:", storageError)
      const detail = storageError.message ? `: ${storageError.message}` : ""
      return NextResponse.json(
        {
          success: false,
          error: `ファイルのストレージへのアップロードに失敗しました${detail}。BLOB_READ_WRITE_TOKENやストレージ設定を確認してください。`,
        },
        { status: 500 },
      )
    }

    try {
      const pdfDocument = await prisma.pdfDocument.create({
        data: {
          name: filename,
          url: blob.url,
        },
      })

      return NextResponse.json({ success: true, pdfDocument }, { status: 201 })
    } catch (dbError) {
      console.error("Error saving PDF document to database:", dbError)
      return NextResponse.json({ success: false, error: "データベースへの保存に失敗しました" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error during file upload process:", error)

    // Default error message
    let detailedErrorMessage = "ファイルのアップロード処理中に予期せぬエラーが発生しました。"

    // Check if the error object has a message property for more details
    if (error && error.message) {
      detailedErrorMessage = `アップロードエラー: ${error.message}。`
    } else if (typeof error === "string") {
      detailedErrorMessage = `アップロードエラー: ${error}。`
    }

    // Add advice if it seems like a storage-specific issue
    // The original error message "ファイルのストレージへのアップロードに失敗しました" suggests this path.
    if (
      detailedErrorMessage.toLowerCase().includes("storage") ||
      detailedErrorMessage.toLowerCase().includes("blob") ||
      (error && error.message && error.message.toLowerCase().includes("put"))
    ) {
      detailedErrorMessage += " ストレージ設定、権限（BLOB_READ_WRITE_TOKENなど）を確認してください。"
    }

    return NextResponse.json({ success: false, error: detailedErrorMessage }, { status: 500 })
  }
}
