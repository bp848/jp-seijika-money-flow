import { type NextRequest, NextResponse } from "next/server"
import { put, del } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const file = (await request.formData()).get("file") as File | null
  if (!file) {
    return NextResponse.json({ error: "ファイルが見つかりません", code: "FILE_NOT_FOUND" }, { status: 400 })
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "PDFファイルのみアップロード可能です", code: "INVALID_FILE_TYPE" },
      { status: 400 },
    )
  }
  if (file.size > 4.5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "ファイルサイズが大きすぎます (最大4.5MB)", code: "FILE_TOO_LARGE" },
      { status: 400 },
    )
  }

  const uniqueFilename = `${uuidv4()}-${file.name}`
  let blobUrl: string | undefined

  try {
    const blobResult = await put(uniqueFilename, file, { access: "public", contentType: file.type })
    blobUrl = blobResult.url

    const partyNameFromFileName = "不明" // 実装箇所: ファイル名等から政党名を抽出するロジック
    const regionFromFileName = "不明" // 実装箇所: ファイル名等から地域名を抽出するロジック

    const document = await prisma.pdfDocument.create({
      data: {
        file_name: file.name,
        blob_url: blobUrl,
        file_size: file.size,
        party_name: partyNameFromFileName,
        region: regionFromFileName,
        status: "pending_upload",
      },
    })

    return NextResponse.json(
      { success: true, document, message: "ファイルが正常にアップロードされました" },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Upload API Error:", error)
    if (blobUrl) {
      await del(blobUrl).catch((delError) => console.error("Orphaned blob deletion failed:", delError))
    }
    return NextResponse.json(
      { error: "サーバーエラーが発生しました", code: "INTERNAL_SERVER_ERROR", details: error.message },
      { status: 500 },
    )
  }
}
