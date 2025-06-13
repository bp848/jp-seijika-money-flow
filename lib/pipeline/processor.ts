import prisma from "@/lib/prisma"
import pdf from "pdf-parse/lib/pdf-parse.js"
import Groq from "groq-sdk"
import crypto from "crypto"

// This processor function encapsulates the entire pipeline for a single document.
// It can be called from a cron job, a manual trigger, or any other process.

// Helper types for structured data from Groq
type GroqParsedReport = {}

// Helper functions for data parsing (can be moved to a utils file)
function safeParseInt(value: any): number | undefined {
  // ...
}
function safeParseDate(dateStr: string | undefined): string | undefined {
  // ...
}

function splitTextIntoChunks(text: string, chunkSize = 1000, overlap = 100): string[] {
  // ...
}

async function generateEmbeddingsForChunks(chunks: string[]): Promise<any[]> {
  // 実装箇所: 実際のベクトル生成処理
  console.warn("generateEmbeddingsForChunks: 実際のベクトル生成処理が実装されていません。")
  return chunks.map((_chunk, index) => ({
    chunk_index: index,
    embedding_vector: { vector: Array(1536).fill(0.01 * index) },
  }))
}

export async function processSingleDocument(documentId: string) {
  console.log(`[PIPELINE] Starting processing for document: ${documentId}`)

  try {
    // 1. Fetch Document Info
    const doc = await prisma.pdfDocument.findUnique({ where: { id: documentId } })
    if (!doc) throw new Error(`Document not found: ${documentId}`)
    if (!doc.blob_url) throw new Error(`Blob URL is missing for document: ${documentId}`)

    await prisma.pdfDocument.update({ where: { id: documentId }, data: { status: "processing_pipeline" } })

    // 2. Fetch PDF from Blob and Extract Text
    const response = await fetch(doc.blob_url)
    if (!response.ok) throw new Error(`Failed to download PDF from ${doc.blob_url}`)
    const pdfBuffer = await response.arrayBuffer()
    const fileHash = crypto.createHash("sha256").update(Buffer.from(pdfBuffer)).digest("hex")

    const data = await pdf(Buffer.from(pdfBuffer))
    const ocrText = data.text
    if (!ocrText || ocrText.trim().length === 0) {
      throw new Error("Failed to extract text or text is empty.")
    }
    await prisma.pdfDocument.update({
      where: { id: documentId },
      data: { ocr_text: ocrText, file_hash: fileHash },
    })
    console.log(`[PIPELINE] Text extracted for document: ${documentId}`)

    // 3. Analyze with Groq
    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) throw new Error("GROQ_API_KEY is not set.")
    const groq = new Groq({ apiKey: groqApiKey })

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `あなたは日本の政治資金収支報告書を解析する専門家です。提供されたOCRテキストから情報を抽出し、指定されたJSON形式で出力してください。金額は数値型(整数)で、カンマや円マークは含めないでください。日付は可能な限りYYYY-MM-DD形式で抽出してください。該当情報がない場合はプロパティ自体を省略するか、nullとしてください。`,
        },
        { role: "user", content: `以下のOCRテキストを解析してください:\n\n---\n${ocrText}\n---` },
      ],
      model: "llama3-70b-8192",
      temperature: 0.1,
      response_format: { type: "json_object" },
    })
    const rawJson = chatCompletion.choices[0]?.message?.content
    if (!rawJson) throw new Error("Groq returned an empty response.")
    const parsedData = JSON.parse(rawJson) as GroqParsedReport
    console.log(`[PIPELINE] Groq analysis complete for document: ${documentId}`)

    // 4. Save structured data to Database (using a transaction)
    // This part assumes a different data model (political_organizations etc.) than the PdfDocument one.
    // You might need to adapt this to your actual schema.
    // For this example, we'll just log it.
    console.log(`[PIPELINE] Storing structured data for document: ${documentId}`)
    // await prisma.$transaction(async (tx) => {
    //   // ... logic to upsert into political_organizations, financial_summaries, etc.
    // });

    // 5. Create Embeddings for LangChain/RAG
    const chunks = splitTextIntoChunks(ocrText)
    if (chunks.length > 0) {
      const embeddingsData = await generateEmbeddingsForChunks(chunks)
      const embeddingsToCreate = chunks.map((chunkText, index) => ({
        document_id: documentId,
        chunk_index: index,
        chunk_text: chunkText,
        embedding_vector: embeddingsData.find((e) => e.chunk_index === index)?.embedding_vector ?? {},
      }))

      await prisma.$transaction(async (tx) => {
        await tx.documentEmbedding.deleteMany({ where: { document_id: documentId } })
        await tx.documentEmbedding.createMany({ data: embeddingsToCreate })
      })
      console.log(`[PIPELINE] Embeddings created for document: ${documentId}`)
    }

    // 6. Finalize Status
    await prisma.pdfDocument.update({ where: { id: documentId }, data: { status: "completed" } })
    console.log(`[PIPELINE] Successfully processed document: ${documentId}`)
    return { success: true, documentId }
  } catch (error: any) {
    console.error(`[PIPELINE] Error processing document ${documentId}:`, error)
    await prisma.pdfDocument.update({
      where: { id: documentId },
      data: { status: "indexing_failed", error_message: error.message },
    })
    return { success: false, documentId, error: error.message }
  }
}
