import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import pdf from "pdf-parse/lib/pdf-parse.js" //  pdf-parse をインポート

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const GROQ_API_KEY = process.env.GROQ_API_KEY!

interface IndexRequestBody {
  documentIds: string[]
  reprocess?: boolean
}

// 詳細ログ機能
function logOcr(level: "INFO" | "ERROR" | "DEBUG", message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logEntry = `[${timestamp}] PDF_PROCESS-${level}: ${message} ${data ? JSON.stringify(data) : ""}`
  console.log(logEntry)

  try {
    supabase
      .from("system_logs")
      .insert({
        level: level.toLowerCase(),
        file_name: "pdf-index-route",
        message,
        metadata: data || null,
        timestamp: new Date().toISOString(),
      })
      .then(() => {})
      .catch((err) => console.error("ログ保存エラー:", err))
  } catch (e) {
    console.error("ログ保存中のエラー:", e)
  }

  return logEntry
}

// PDFからテキストを抽出する関数
async function extractTextFromPdf(blobUrl: string, documentId: string, fileName: string): Promise<string> {
  logOcr("INFO", "PDFからのテキスト抽出処理開始", { documentId, blobUrl, fileName })

  try {
    const response = await fetch(blobUrl)
    if (!response.ok) {
      throw new Error(`PDFファイルのダウンロードに失敗しました: ${response.status} ${response.statusText}`)
    }
    const pdfBuffer = await response.arrayBuffer()

    // pdf-parse を使用してテキストを抽出
    const data = await pdf(Buffer.from(pdfBuffer))

    if (!data.text || data.text.trim().length === 0) {
      logOcr("WARN", "PDFからテキストが抽出できませんでした。空または画像のみのPDFの可能性があります。", {
        documentId,
        fileName,
      })
      // 抽出できなかった場合でも、ファイル名やIDなどのメタ情報を含むテキストを返すことも検討できる
      return `ファイル名: ${fileName}\n文書ID: ${documentId}\nURL: ${blobUrl}\n\nこのPDFからテキストコンテンツを抽出できませんでした。`
    }

    logOcr("INFO", "PDFからのテキスト抽出成功", {
      documentId,
      fileName,
      textLength: data.text.length,
      textPreview: data.text.substring(0, 200) + "...",
    })
    return data.text
  } catch (error) {
    logOcr("ERROR", "PDFからのテキスト抽出処理中にエラー発生", { documentId, fileName, error })
    throw error
  }
}

// Groqインデックス作成（変更なし）
async function createGroqIndex(text: string, documentId: string): Promise<string> {
  logOcr("INFO", "Groqインデックス作成開始", { documentId })

  try {
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY環境変数が設定されていません")
    }
    const indexId = `groq_index_${documentId}_${Date.now()}`
    const chunks = splitTextIntoChunks(text, 1000)

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const { error: embeddingError } = await supabase.from("document_embeddings").insert({
        document_id: documentId,
        chunk_index: i,
        chunk_text: chunk,
        embedding_vector: new Array(1536).fill(0).map(() => Math.random()),
      })
      if (embeddingError) {
        logOcr("ERROR", "ベクトル保存エラー", { documentId, chunkIndex: i, error: embeddingError })
        throw new Error(`ベクトル保存エラー: ${embeddingError.message}`)
      }
    }
    logOcr("INFO", "Groqインデックス作成完了", { documentId, indexId, chunksCount: chunks.length })
    return indexId
  } catch (error) {
    logOcr("ERROR", "Groqインデックス作成エラー", { documentId, error })
    throw error
  }
}

// テキストをチャンクに分割（変更なし）
function splitTextIntoChunks(text: string, chunkSize: number): string[] {
  const chunks = []
  const sentences = text.split(/[。！？\n]/).filter((s) => s.trim().length > 0)
  let currentChunk = ""
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += sentence + "。"
    }
  }
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim())
  }
  return chunks.length > 0 ? chunks : [text.substring(0, chunkSize)]
}

export async function POST(request: NextRequest) {
  const requestId = `pdf_process_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  logOcr("INFO", "PDF処理API開始", { requestId })

  try {
    const { documentIds, reprocess = false } = (await request.json()) as IndexRequestBody

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      logOcr("ERROR", "無効なdocumentIds", { documentIds })
      return NextResponse.json(
        { success: false, error: "documentIdsは空でない配列である必要があります" },
        { status: 400 },
      )
    }

    logOcr("INFO", "処理対象文書", { documentIds, reprocess, requestId })
    const results = []

    for (const docId of documentIds) {
      let currentDbStatus = ""
      try {
        logOcr("INFO", `文書処理開始: ${docId}`)
        const { data: docData, error: fetchError } = await supabase
          .from("pdf_documents")
          .select("blob_url, status, ocr_text, file_name, party_name, region")
          .eq("id", docId)
          .single()

        if (fetchError || !docData) {
          logOcr("ERROR", "文書が見つかりません", { docId, fetchError })
          results.push({ documentId: docId, success: false, error: "文書が見つかりません" })
          continue
        }

        currentDbStatus = docData.status
        logOcr("INFO", "文書情報取得完了", {
          docId,
          fileName: docData.file_name,
          currentStatus: currentDbStatus,
        })

        let ocrText = docData.ocr_text
        // 「ocr_failed」だけでなく、「text_extraction_failed」のような新しいステータスも考慮に入れるべき
        if (reprocess || !ocrText || ["pending", "ocr_failed", "text_extraction_failed"].includes(currentDbStatus)) {
          logOcr("INFO", "テキスト抽出処理実行", { docId, reprocess, hasExistingText: !!ocrText })
          await supabase
            .from("pdf_documents")
            .update({
              status: "text_extraction_processing", // 新しいステータス
              error_message: null,
              indexing_error_message: null,
            })
            .eq("id", docId)
          currentDbStatus = "text_extraction_processing"

          try {
            ocrText = await extractTextFromPdf(docData.blob_url, docId, docData.file_name) // 修正：実際のテキスト抽出関数を呼ぶ

            // 抽出結果が「抽出できませんでした」というメッセージの場合、ステータスを更新
            if (ocrText.includes("このPDFからテキストコンテンツを抽出できませんでした")) {
              await supabase
                .from("pdf_documents")
                .update({
                  ocr_text: ocrText, // メッセージを保存
                  status: "text_extraction_failed", // 新しい失敗ステータス
                  error_message: "PDFからテキストを抽出できませんでした。",
                })
                .eq("id", docId)
              currentDbStatus = "text_extraction_failed"
              logOcr("WARN", "テキスト抽出失敗（内容なしまたは画像PDF）", { docId, fileName: docData.file_name })
              // この場合、インデックス処理に進むべきか、ここで終了するかは要件による
              // ここではエラーとして扱い、インデックス処理には進まない
              results.push({
                documentId: docId,
                success: false,
                error: "PDFからテキストを抽出できませんでした。",
              })
              continue // 次のドキュメントへ
            }

            await supabase
              .from("pdf_documents")
              .update({
                ocr_text: ocrText,
                status: "text_extraction_completed",
                error_message: null,
              })
              .eq("id", docId)
            currentDbStatus = "text_extraction_completed"
            logOcr("INFO", "テキスト抽出・保存完了", { docId, textLength: ocrText.length })
          } catch (extractionError) {
            logOcr("ERROR", "テキスト抽出処理失敗", { docId, extractionError })
            await supabase
              .from("pdf_documents")
              .update({
                status: "text_extraction_failed", // 新しい失敗ステータス
                error_message: extractionError instanceof Error ? extractionError.message : "不明なテキスト抽出エラー",
              })
              .eq("id", docId)
            results.push({
              documentId: docId,
              success: false,
              error: `テキスト抽出失敗: ${extractionError instanceof Error ? extractionError.message : "不明なエラー"}`,
            })
            continue
          }
        }

        // Groqインデックス処理 (ocrText があり、かつ text_extraction_failed でない場合)
        if (
          ocrText &&
          currentDbStatus !== "text_extraction_failed" &&
          (reprocess || !["completed"].includes(currentDbStatus))
        ) {
          logOcr("INFO", "Groqインデックス処理実行", { docId })
          await supabase
            .from("pdf_documents")
            .update({
              status: "indexing_processing",
              indexing_error_message: null,
            })
            .eq("id", docId)
          currentDbStatus = "indexing_processing"

          try {
            const groqIndexId = await createGroqIndex(ocrText, docId)
            await supabase
              .from("pdf_documents")
              .update({
                groq_index_id: groqIndexId,
                status: "completed",
                indexing_error_message: null,
                error_message: null, // 以前のエラーメッセージをクリア
              })
              .eq("id", docId)
            currentDbStatus = "completed"
            logOcr("INFO", "Groqインデックス処理・保存完了", { docId, groqIndexId })
            results.push({
              documentId: docId,
              success: true,
              message: "テキスト抽出およびインデックス化が完了しました",
              ocrTextLength: ocrText.length,
              groqIndexId,
            })
          } catch (indexError) {
            logOcr("ERROR", "Groqインデックス処理失敗", { docId, indexError })
            await supabase
              .from("pdf_documents")
              .update({
                status: "indexing_failed",
                indexing_error_message: indexError instanceof Error ? indexError.message : "不明なインデックスエラー",
              })
              .eq("id", docId)
            results.push({
              documentId: docId,
              success: false,
              error: `インデックス処理失敗: ${indexError instanceof Error ? indexError.message : "不明なエラー"}`,
            })
          }
        } else if (currentDbStatus === "completed" && !reprocess) {
          logOcr("INFO", "既に処理済み", { docId })
          results.push({ documentId: docId, success: true, message: "既に処理済みです" })
        } else if (!ocrText || currentDbStatus === "text_extraction_failed") {
          logOcr("WARN", "テキストが不足しているか抽出失敗のためインデックス処理スキップ", { docId, currentDbStatus })
          // results には既に extractionError で追加されているか、ここで追加する
          if (!results.find((r) => r.documentId === docId)) {
            results.push({
              documentId: docId,
              success: false,
              error: "テキストが不足しているか抽出に失敗したため、インデックス処理は行われませんでした。",
            })
          }
        }
      } catch (innerError: any) {
        logOcr("ERROR", "文書処理中の例外", { docId, innerError })
        const errorMessage = innerError.message || "不明なエラーが発生しました"
        const updatePayload =
          currentDbStatus.startsWith("text_extraction_") || currentDbStatus === "pending"
            ? { status: "text_extraction_failed", error_message: errorMessage, indexing_error_message: null }
            : { status: "indexing_failed", indexing_error_message: errorMessage, error_message: null }
        await supabase.from("pdf_documents").update(updatePayload).eq("id", docId)
        results.push({ documentId: docId, success: false, error: errorMessage })
      }
    }

    logOcr("INFO", "全文書処理完了", {
      requestId,
      totalDocuments: documentIds.length,
      successCount: results.filter((r) => r.success).length,
      failureCount: results.filter((r) => !r.success).length,
    })

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: documentIds.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
      message: `${documentIds.length}件の文書処理リクエストが完了しました`,
      requestId,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    logOcr("ERROR", "API処理中の致命的エラー", { requestId, error })
    return NextResponse.json(
      {
        success: false,
        error: "PDF処理中にエラーが発生しました",
        details: error.message || "不明なエラー",
        requestId,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
