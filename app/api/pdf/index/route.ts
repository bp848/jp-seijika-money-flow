import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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
  const logEntry = `[${timestamp}] OCR-${level}: ${message} ${data ? JSON.stringify(data) : ""}`
  console.log(logEntry)

  // DBにもログを保存
  try {
    supabase
      .from("system_logs")
      .insert({
        level: level.toLowerCase(),
        // component: "pdf-ocr", // スキーマに 'component' がないためコメントアウトまたは削除
        file_name: "pdf-index-route", // または documentId など関連情報
        message,
        metadata: data || null, // data が undefined の場合は null
        timestamp: new Date().toISOString(), // スキーマの 'timestamp' に合わせる
        // process_id, status, error_stack, step なども必要に応じて設定
      })
      .then(() => {})
      .catch((err) => console.error("ログ保存エラー:", err))
  } catch (e) {
    console.error("ログ保存中のエラー:", e)
  }

  return logEntry
}

// 簡易OCR処理（PDFからテキスト抽出のモック）
async function performOcrProcessing(blobUrl: string, documentId: string): Promise<string> {
  logOcr("INFO", "OCR処理開始", { documentId, blobUrl })

  try {
    // 実際のOCR処理の代わりにモックテキストを生成
    // 本番環境では実際のOCRライブラリを使用
    const mockOcrText = `
政治資金収支報告書

収入の部
寄付金: 1,000,000円
政党交付金: 5,000,000円
その他収入: 500,000円
合計: 6,500,000円

支出の部
人件費: 2,000,000円
事務所費: 1,500,000円
政治活動費: 2,500,000円
その他支出: 500,000円
合計: 6,500,000円

主要寄付者:
- 株式会社サンプル企業: 500,000円
- 個人寄付者A: 300,000円
- 個人寄付者B: 200,000円

文書ID: ${documentId}
処理日時: ${new Date().toISOString()}
ファイルURL: ${blobUrl}
  `.trim()

    logOcr("INFO", "OCR処理完了", {
      documentId,
      textLength: mockOcrText.length,
      textPreview: mockOcrText.substring(0, 200) + "...",
    })

    return mockOcrText
  } catch (error) {
    logOcr("ERROR", "OCR処理エラー", { documentId, error })
    throw error
  }
}

// Groqインデックス作成（簡易版）
async function createGroqIndex(text: string, documentId: string): Promise<string> {
  logOcr("INFO", "Groqインデックス作成開始", { documentId })

  try {
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY環境変数が設定されていません")
    }

    // 簡易的なインデックスIDを生成
    const indexId = `groq_index_${documentId}_${Date.now()}`

    // 実際のベクトル化処理の代わりに、テキストをチャンクに分割してDBに保存
    const chunks = splitTextIntoChunks(text, 1000)

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]

      // ベクトル埋め込みテーブルに保存
      const { error: embeddingError } = await supabase.from("document_embeddings").insert({
        // id: crypto.randomUUID(), // スキーマにid列があり、自動生成されない場合はUUIDを生成
        document_id: documentId,
        chunk_index: i,
        chunk_text: chunk, // 'content' から 'chunk_text' へ変更
        embedding_vector: new Array(1536).fill(0).map(() => Math.random()), // 'embedding' から 'embedding_vector' へ変更
        // metadata: { ... } // スキーマに 'metadata' 列がないため削除、または他の列にマッピング
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

// テキストをチャンクに分割
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
  const requestId = `ocr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  logOcr("INFO", "OCR・インデックス処理API開始", { requestId })

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

        // 文書情報取得
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

        // OCR処理
        let ocrText = docData.ocr_text
        if (reprocess || !ocrText || ["pending", "ocr_failed"].includes(currentDbStatus)) {
          logOcr("INFO", "OCR処理実行", { docId, reprocess, hasExistingText: !!ocrText })

          // ステータス更新: OCR処理中
          await supabase
            .from("pdf_documents")
            .update({
              status: "ocr_processing",
              error_message: null,
              indexing_error_message: null,
            })
            .eq("id", docId)

          currentDbStatus = "ocr_processing"

          try {
            ocrText = await performOcrProcessing(docData.blob_url, docId)

            if (!ocrText || ocrText.trim().length === 0) {
              throw new Error("OCRによるテキスト抽出結果が空です")
            }

            // OCR完了をDBに保存
            await supabase
              .from("pdf_documents")
              .update({
                ocr_text: ocrText,
                status: "text_extraction_completed",
                error_message: null,
              })
              .eq("id", docId)

            currentDbStatus = "text_extraction_completed"
            logOcr("INFO", "OCR処理・保存完了", { docId, textLength: ocrText.length })
          } catch (ocrError) {
            logOcr("ERROR", "OCR処理失敗", { docId, ocrError })
            await supabase
              .from("pdf_documents")
              .update({
                status: "ocr_failed",
                error_message: ocrError instanceof Error ? ocrError.message : "不明なエラー",
              })
              .eq("id", docId)

            results.push({
              documentId: docId,
              success: false,
              error: `OCR処理失敗: ${ocrError instanceof Error ? ocrError.message : "不明なエラー"}`,
            })
            continue
          }
        }

        // Groqインデックス処理
        if (ocrText && (reprocess || !["completed"].includes(currentDbStatus))) {
          logOcr("INFO", "Groqインデックス処理実行", { docId })

          // ステータス更新: インデックス処理中
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

            // インデックス完了をDBに保存
            await supabase
              .from("pdf_documents")
              .update({
                groq_index_id: groqIndexId,
                status: "completed",
                indexing_error_message: null,
                error_message: null,
              })
              .eq("id", docId)

            currentDbStatus = "completed"
            logOcr("INFO", "Groqインデックス処理・保存完了", { docId, groqIndexId })

            results.push({
              documentId: docId,
              success: true,
              message: "OCRおよびインデックス化が完了しました",
              ocrTextLength: ocrText.length,
              groqIndexId,
            })
          } catch (indexError) {
            logOcr("ERROR", "Groqインデックス処理失敗", { docId, indexError })
            await supabase
              .from("pdf_documents")
              .update({
                status: "indexing_failed",
                indexing_error_message: indexError instanceof Error ? indexError.message : "不明なエラー",
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
        } else if (!ocrText) {
          logOcr("ERROR", "OCRテキストが不足", { docId })
          results.push({ documentId: docId, success: false, error: "OCRテキストが不足しています" })
        }
      } catch (innerError: any) {
        logOcr("ERROR", "文書処理中の例外", { docId, innerError })
        const errorMessage = innerError.message || "不明なエラーが発生しました"

        // エラー状態をDBに保存
        const updatePayload =
          currentDbStatus.startsWith("ocr_") || currentDbStatus === "pending"
            ? { status: "ocr_failed", error_message: errorMessage, indexing_error_message: null }
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
      message: `${documentIds.length}件の文書処理が完了しました`,
      requestId,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    logOcr("ERROR", "API処理中の致命的エラー", { requestId, error })
    return NextResponse.json(
      {
        success: false,
        error: "OCR・インデックス処理中にエラーが発生しました",
        details: error.message || "不明なエラー",
        requestId,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
