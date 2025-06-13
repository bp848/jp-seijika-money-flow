import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import pdf from "pdf-parse/lib/pdf-parse.js"
import crypto from "crypto"

async function extractTextFromPdfBuffer(
  pdfBuffer: ArrayBuffer,
): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    if (pdfBuffer.byteLength === 0) {
      return { success: false, error: "PDFファイルが空です。" }
    }
    const data = await pdf(Buffer.from(pdfBuffer))
    if (!data.text || data.text.trim().length === 0) {
      return {
        success: false,
        text: "",
        error: "PDFからテキストを抽出できませんでした。画像のみのPDFまたは破損ファイルの可能性があります。",
      }
    }
    return { success: true, text: data.text }
  } catch (error: any) {
    console.error("Error during PDF text extraction from buffer:", error)
    return { success: false, error: `PDFテキスト抽出エラー: ${error.message}` }
  }
}

function splitTextIntoChunks(text: string, chunkSize = 1000, overlap = 100): string[] {
  const chunks: string[] = []
  if (!text || text.trim().length === 0) return chunks
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.substring(i, i + chunkSize))
    if (i + chunkSize >= text.length) break
  }
  return chunks
}

async function generateEmbeddingsForChunks(chunks: string[]): Promise<any[]> {
  // 実装箇所: 実際のベクトル生成処理 (例: OpenAI Embeddings API)
  console.warn("generateEmbeddingsForChunks: 実際のベクトル生成処理が実装されていません。")
  return chunks.map((_chunk, index) => ({
    chunk_index: index,
    embedding_vector: { vector: Array(1536).fill(0.01 * index) },
  }))
}

export async function POST(request: NextRequest) {
  try {
    const { documentIds } = (await request.json()) as { documentIds?: string[] }

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json({ error: "documentIds (配列) が必要です", code: "INVALID_REQUEST" }, { status: 400 })
    }

    const results = await Promise.allSettled(
      documentIds.map(async (docId) => {
        try {
          const doc = await prisma.pdfDocument.findUnique({ where: { id: docId } })
          if (!doc) throw new Error(`ドキュメントが見つかりません: ${docId}`)
          if (!doc.blob_url) throw new Error(`ドキュメント ${docId} にblob_urlがありません。`)

          // --- DUPLICATE CHECK LOGIC ---
          const response = await fetch(doc.blob_url)
          if (!response.ok) throw new Error(`PDFダウンロード失敗: ${response.statusText} (URL: ${doc.blob_url})`)
          const pdfBuffer = await response.arrayBuffer()
          const fileHash = crypto.createHash("sha256").update(Buffer.from(pdfBuffer)).digest("hex")

          const existingDoc = await prisma.pdfDocument.findFirst({
            where: { file_hash: fileHash, id: { not: docId } },
          })

          if (existingDoc) {
            await prisma.pdfDocument.update({
              where: { id: docId },
              data: {
                status: "duplicate",
                error_message: `重複ファイルです。既存のドキュメントID: ${existingDoc.id}`,
                file_hash: fileHash,
              },
            })
            return {
              documentId: docId,
              success: false,
              error: `重複ファイルです。既存のドキュメントID: ${existingDoc.id}`,
            }
          }
          // --- END DUPLICATE CHECK ---

          // No duplicate, proceed with processing
          await prisma.pdfDocument.update({
            where: { id: docId },
            data: {
              file_hash: fileHash,
              status: "text_extraction_processing",
              error_message: null,
              indexing_error_message: null,
            },
          })

          const extractionResult = await extractTextFromPdfBuffer(pdfBuffer)

          if (!extractionResult.success || !extractionResult.text || extractionResult.text.trim().length === 0) {
            await prisma.pdfDocument.update({
              where: { id: docId },
              data: {
                status: "text_extraction_failed",
                ocr_text: extractionResult.text ?? "",
                error_message: extractionResult.error || "テキスト内容が空です。",
              },
            })
            return { documentId: docId, success: false, error: extractionResult.error || "テキスト内容が空です。" }
          }

          const ocrTextContent = extractionResult.text
          await prisma.pdfDocument.update({
            where: { id: docId },
            data: { status: "text_extraction_completed", ocr_text: ocrTextContent, error_message: null },
          })

          await prisma.pdfDocument.update({ where: { id: docId }, data: { status: "indexing_processing" } })

          const chunks = splitTextIntoChunks(ocrTextContent)
          if (chunks.length === 0) throw new Error("テキストからチャンクを生成できませんでした。")

          const generatedEmbeddings = await generateEmbeddingsForChunks(chunks)
          const embeddingsToCreate = chunks.map((chunkText, index) => ({
            document_id: docId,
            chunk_index: index,
            chunk_text: chunkText,
            embedding_vector: generatedEmbeddings.find((e) => e.chunk_index === index)?.embedding_vector ?? {},
          }))

          await prisma.$transaction(async (tx) => {
            await tx.documentEmbedding.deleteMany({ where: { document_id: docId } })
            await tx.documentEmbedding.createMany({ data: embeddingsToCreate })
          })

          const groqIndexIdValue = `index_${docId}_${new Date().getTime()}`
          await prisma.pdfDocument.update({
            where: { id: docId },
            data: { status: "completed", groq_index_id: groqIndexIdValue, indexing_error_message: null },
          })

          return { documentId: docId, success: true, indexId: groqIndexIdValue }
        } catch (error: any) {
          console.error(`インデックス処理エラー (ドキュメントID: ${docId}):`, error)
          await prisma.pdfDocument
            .update({
              where: { id: docId },
              data: { status: "indexing_failed", indexing_error_message: error.message },
            })
            .catch((dbUpdateError) => console.error(`Failed to update error status for ${docId}:`, dbUpdateError))
          return { documentId: docId, success: false, error: error.message }
        }
      }),
    )

    const processedResults = results.map((r) =>
      r.status === "fulfilled"
        ? r.value
        : { success: false, error: (r as PromiseRejectedResult).reason?.message || "不明なエラー" },
    )

    return NextResponse.json({
      success: true,
      results: processedResults,
      message: `${documentIds.length}件のドキュメントのインデックス処理リクエストを受け付けました。`,
    })
  } catch (error: any) {
    console.error("Index API全体のエラー:", error)
    return NextResponse.json(
      {
        error: "インデックスAPI処理中に予期せぬエラーが発生しました",
        code: "UNEXPECTED_API_ERROR",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
