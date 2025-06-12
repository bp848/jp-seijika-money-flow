import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { GoogleAuth } from "google-auth-library"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const GROQ_API_KEY = process.env.GROQ_API_KEY!

// --- Type Definitions ---
interface IndexRequestBody {
  documentIds: string[]
  reprocess?: boolean
}

interface AiEntity {
  type: string
  mentionText: string
  confidence: number
}

interface AiTableCell {
  layout: {
    textSegments: { startIndex: string; endIndex: string }[]
    text: string // Document AIのレスポンスでは text が直接 cells の layout にある
  }
  rowIndex: number
  columnIndex: number
}

interface AiTableRow {
  cells: AiTableCell[]
}

interface AiTable {
  headerRows: AiTableRow[]
  bodyRows: AiTableRow[]
  // Document AIのレスポンスのテーブル構造に合わせる
  // layout: { textSegments: { startIndex: string; endIndex: string }[] };
}

interface AiDocument {
  text: string
  entities: AiEntity[]
  tables?: AiTable[] // Document AIのレスポンスでは pages の中に tables があることが多い
  // Document AIのレスポンスに合わせて調整
  pages?: {
    tables: AiTable[]
  }[]
}

interface AiResponse {
  document: AiDocument
}

interface ParsedTransaction {
  date?: string
  description?: string
  amount?: number
  name?: string
  address?: string
  raw_row_text?: string // 元の行テキストを保存
}

// --- Helper Functions ---

function logOcr(level: "INFO" | "ERROR" | "DEBUG", message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logEntry = `[${timestamp}] OCR-${level}: ${message} ${data ? JSON.stringify(data) : ""}`
  console.log(logEntry)
  supabase
    .from("system_logs")
    .insert({
      level: level.toLowerCase(),
      file_name: "pdf-index-route", // component から file_name へ
      message,
      metadata: data || null, // data から metadata へ
      timestamp: new Date().toISOString(), // created_at から timestamp へ
    })
    .then(() => {})
    .catch((err) => console.error("ログ保存エラー:", err))
  return logEntry
}

const findEntityValue = (entities: AiEntity[], type: string): string | undefined => {
  const entity = entities.find((e) => e.type === type)
  return entity ? entity.mentionText.trim() : undefined
}

const convertJapaneseEraToYear = (eraDate: string | undefined): string | undefined => {
  if (!eraDate) return undefined
  // 全角数字・記号を半角に変換
  const normalizedDate = eraDate
    .replace(/[．・／]/g, ".")
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/[（）]/g, "") // カッコを除去
    .trim()

  // R6.5.10, R06.05.10, R6/5/10, R6年5月10日 などの形式に対応
  const match = normalizedDate.match(/([令和元HS])(\d{1,2})[./年]?(\d{1,2})[./月]?(\d{1,2})日?/)
  if (!match) {
    // 西暦の可能性も考慮 (YYYY.MM.DD or YYYY/MM/DD)
    const adMatch = normalizedDate.match(/(\d{4})[./年]?(\d{1,2})[./月]?(\d{1,2})日?/)
    if (adMatch) {
      const year = Number.parseInt(adMatch[1], 10)
      // 年が妥当な範囲かチェック (例: 1900-2100)
      if (year >= 1900 && year <= 2100) {
        return `${adMatch[1]}-${adMatch[2].padStart(2, "0")}-${adMatch[3].padStart(2, "0")}`
      }
    }
    logOcr("DEBUG", `不明な日付形式（変換失敗）: ${eraDate} -> ${normalizedDate}`)
    return eraDate // 変換できない場合は元の日付文字列を返すか、エラー処理
  }
  const [_, eraChar, yearStr, monthStr, dayStr] = match
  let baseYear = 0
  const year = Number.parseInt(yearStr, 10)
  switch (eraChar.toUpperCase()) {
    case "R":
    case "令":
      baseYear = 2018
      break
    case "H":
    case "平":
      baseYear = 1988
      break
    case "S":
    case "昭":
      baseYear = 1925
      break
    case "元": // 元号の元年対応
      if (eraChar === "令" || eraChar === "R") baseYear = 2018
      else if (eraChar === "平" || eraChar === "H") baseYear = 1988
      else if (eraChar === "昭" || eraChar === "S") baseYear = 1925
      else return eraDate // 不明な元号
      const adYearFirst = baseYear + 1
      return `${adYearFirst}-${monthStr.padStart(2, "0")}-${dayStr.padStart(2, "0")}`
    default:
      return eraDate // 不明な元号
  }
  const adYear = baseYear + year
  return `${adYear}-${monthStr.padStart(2, "0")}-${dayStr.padStart(2, "0")}`
}

const createHeaderMap = (headerRow: AiTableRow): Record<string, number> => {
  const map: Record<string, number> = {}
  headerRow.cells.forEach((cell, index) => {
    const text = cell.layout.text.trim().replace(/\s/g, "") // 空白除去
    // 様々なヘッダーのバリエーションに対応
    if (/年月日|日付|取引日/i.test(text)) map["date"] = index
    if (/摘要|内容|科目|目的/i.test(text)) map["description"] = index
    if (/金額|収入額|支出額|円/i.test(text)) map["amount"] = index
    if (/氏名|名称|相手方|支払先|寄付者/i.test(text)) map["name"] = index
    if (/住所|所在地|場所/i.test(text)) map["address"] = index
  })
  return map
}

const parseTransactionRow = (row: AiTableRow, headerMap: Record<string, number>): ParsedTransaction => {
  const getCellText = (key: string): string | undefined => {
    const index = headerMap[key]
    return index !== undefined ? row.cells[index]?.layout?.text?.trim() : undefined
  }
  const amountStr = getCellText("amount")?.replace(/[^0-9]/g, "") // 数字のみ抽出
  const rawTexts = row.cells.map((cell) => cell.layout.text.trim())

  return {
    date: convertJapaneseEraToYear(getCellText("date")),
    description: getCellText("description"),
    amount: amountStr ? Number.parseInt(amountStr, 10) : undefined,
    name: getCellText("name"),
    address: getCellText("address"),
    raw_row_text: rawTexts.join(" | "), // 元の行テキストを結合して保存
  }
}

// --- Core Processing Functions ---

async function performOcrProcessing(blobUrl: string, documentId: string): Promise<AiResponse> {
  logOcr("INFO", "Google Document AI処理開始", { documentId, blobUrl })
  try {
    const fileResponse = await fetch(blobUrl)
    if (!fileResponse.ok) throw new Error(`Blobからのファイルダウンロード失敗: ${fileResponse.statusText}`)
    const fileBuffer = await fileResponse.arrayBuffer()
    const base64File = Buffer.from(fileBuffer).toString("base64")

    const gcpServiceAccountKeyJson = process.env.GCP_SERVICE_ACCOUNT_KEY_JSON
    if (!gcpServiceAccountKeyJson) throw new Error("GCP_SERVICE_ACCOUNT_KEY_JSON 環境変数が設定されていません。")

    let serviceAccountJson
    try {
      serviceAccountJson = JSON.parse(gcpServiceAccountKeyJson)
    } catch (e) {
      throw new Error("GCP_SERVICE_ACCOUNT_KEY_JSON のパースに失敗しました。有効なJSON文字列である必要があります。")
    }

    const auth = new GoogleAuth({
      credentials: { client_email: serviceAccountJson.client_email, private_key: serviceAccountJson.private_key },
      scopes: "https://www.googleapis.com/auth/cloud-platform",
    })
    const authToken = await auth.getAccessToken()

    const processorId = process.env.GCP_DOCUMENTAI_PROCESSOR_ID
    if (!processorId) throw new Error("GCP_DOCUMENTAI_PROCESSOR_ID 環境変数が設定されていません。")
    const gcpProjectId = serviceAccountJson.project_id
    const location = process.env.GCP_DOCUMENTAI_PROCESSOR_LOCATION || "us" // デフォルトは 'us'
    const apiUrl = `https://${location}-documentai.googleapis.com/v1/projects/${gcpProjectId}/locations/${location}/processors/${processorId}:process`

    const requestBody = {
      rawDocument: {
        content: base64File,
        mimeType: "application/pdf",
      },
      // processOptions: { // 必要に応じて追加
      //   ocrConfig: {
      //     enableNativePdfParsing: true, // PDF内のテキストレイヤーを優先
      //     enableImageQualityScores: true,
      //     // hintLanguageCodes: ["ja"], // 日本語を指定
      //   },
      // },
      // skipHumanReview: true // 本番ではfalseまたは未指定を推奨
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      logOcr("ERROR", "Document AI APIエラー", { status: response.status, errorText, documentId })
      throw new Error(`Document AI APIエラー (${response.status}): ${errorText}`)
    }

    const result = (await response.json()) as AiResponse
    if (!result.document || !result.document.text) {
      logOcr("ERROR", "Document AIレスポンス形式不正", { documentId, result })
      throw new Error("Document AIのレスポンスにdocumentまたはdocument.textが含まれていません。")
    }

    logOcr("INFO", "Google Document AI処理完了", { documentId, textLength: result.document.text.length })
    return result
  } catch (error) {
    logOcr("ERROR", "Google Document AI処理中の例外", { documentId, error })
    throw error
  }
}

async function processStructuredData(document: AiDocument, pdfDocumentId: string, fileName: string) {
  logOcr("INFO", "構造化データ処理開始", { pdfDocumentId, fileName })
  const { entities } = document
  // Document AIのレスポンスでは、tablesはdocument.pages[].tablesにあることが多い
  const tables = document.pages?.flatMap((page) => page.tables || []) || []

  try {
    const organizationName = findEntityValue(entities, "organization_name") || fileName.split("_")[1] || "不明な団体" // ファイル名からも推定
    const reportDateRaw = findEntityValue(entities, "report_date")
    const reportDate = convertJapaneseEraToYear(reportDateRaw)
    const reportYear = reportDate
      ? new Date(reportDate).getFullYear()
      : Number.parseInt(
          fileName
            .match(/(\d{4})年度?|_(\d{4})_/)
            ?.slice(1)
            .find(Boolean) || new Date().getFullYear().toString(),
        ) // ファイル名や現在年から推定

    const totalIncomeStr = findEntityValue(entities, "total_income")?.replace(/[^0-9]/g, "")
    const totalExpenditureStr = findEntityValue(entities, "total_expenditure")?.replace(/[^0-9]/g, "")

    if (!organizationName || !reportYear) {
      logOcr("ERROR", "必須エンティティ不足", { organizationName, reportYear, pdfDocumentId })
      throw new Error(
        `必須エンティティ（団体名、報告年）の特定に失敗しました。 Name: ${organizationName}, Year: ${reportYear}`,
      )
    }

    const { data: orgData, error: orgError } = await supabase
      .from("fund_management_organizations")
      .upsert(
        {
          organization_name: organizationName,
          report_year: reportYear,
          total_income: totalIncomeStr ? Number.parseInt(totalIncomeStr, 10) : null,
          total_expenditure: totalExpenditureStr ? Number.parseInt(totalExpenditureStr, 10) : null,
          source_pdf_id: pdfDocumentId, // どのPDFから生成されたかの紐付け
          updated_at: new Date().toISOString(),
        },
        { onConflict: "organization_name, report_year", ignoreDuplicates: false }, // 既存レコードがあれば更新
      )
      .select()
      .single()

    if (orgError) {
      logOcr("ERROR", "政治資金団体UPSERT失敗", { pdfDocumentId, orgError })
      throw new Error(`団体のUpsert失敗: ${orgError.message}`)
    }
    const organizationId = orgData.id
    logOcr("INFO", "政治資金団体UPSERT完了", { organizationId, organizationName, reportYear, pdfDocumentId })

    if (tables && tables.length > 0) {
      for (const table of tables) {
        if (!table.headerRows || table.headerRows.length === 0 || !table.bodyRows || table.bodyRows.length === 0)
          continue

        const headerMap = createHeaderMap(table.headerRows[0])
        // ヘッダーから収入か支出かを判定するロジックを改善
        const headerTextCombined = table.headerRows[0].cells.map((c) => c.layout.text.trim()).join(" ")
        const isIncomeTable = /収入|寄付|受入/i.test(headerTextCombined) && !/支出|支払|経費/i.test(headerTextCombined)
        const isExpenditureTable = /支出|支払|経費/i.test(headerTextCombined)

        const targetTable = isIncomeTable ? "income_records" : isExpenditureTable ? "expenditure_records" : null
        if (!targetTable) {
          logOcr("DEBUG", "対象不明なテーブル（スキップ）", { pdfDocumentId, headerTextCombined })
          continue
        }

        const recordsToInsert = table.bodyRows
          .map((row) => parseTransactionRow(row, headerMap))
          .filter((tx) => tx.amount !== undefined && tx.amount > 0 && tx.description) // 金額があり、摘要があるもののみ
          .map((tx) => ({
            organization_id: organizationId,
            transaction_date: tx.date, // income_date/expenditure_date から共通の transaction_date へ
            description: tx.description,
            amount: tx.amount,
            counterparty_name: tx.name, // donor_name/recipient_name から共通の counterparty_name へ
            counterparty_address: tx.address, // donor_address/recipient_address から共通の counterparty_address へ
            raw_data: tx.raw_row_text, // 元の行テキストを保存
            source_pdf_id: pdfDocumentId,
          }))

        if (recordsToInsert.length > 0) {
          const { error: insertError } = await supabase.from(targetTable).insert(recordsToInsert)
          if (insertError) {
            logOcr("ERROR", `テーブル[${targetTable}]へのデータ挿入失敗`, {
              pdfDocumentId,
              error: insertError.message,
              details: insertError.details,
              recordsCount: recordsToInsert.length,
            })
          } else {
            logOcr("INFO", `テーブル[${targetTable}]へ${recordsToInsert.length}件のレコードを挿入`, {
              pdfDocumentId,
              organizationId,
            })
          }
        }
      }
    } else {
      logOcr("INFO", "テーブルデータなし", { pdfDocumentId })
    }
    logOcr("INFO", "構造化データ処理完了", { pdfDocumentId })
  } catch (error) {
    logOcr("ERROR", "構造化データ処理中の例外", { pdfDocumentId, error })
    // エラーが発生しても、部分的に処理されたデータがある可能性を考慮し、ここでは re-throw しない
    // 呼び出し元で pdf_documents のステータス更新を行う
    throw error // 上位でキャッチしてステータス更新するため再スロー
  }
}

async function createGroqIndex(text: string, documentId: string): Promise<string> {
  logOcr("INFO", "Groqインデックス作成開始", { documentId })
  try {
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY環境変数が設定されていません")
    // 実際のGroq API呼び出しやベクトル化処理はここにはない。
    // これはプレースホルダーであり、実際のベクトルDBへの保存処理が必要。
    const indexId = `groq_placeholder_index_${documentId}_${Date.now()}`

    // テキストをチャンクに分割 (簡易版)
    const chunkSize = 1000 // 1チャンクあたりの最大文字数
    const chunks: string[] = []
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize))
    }

    if (chunks.length === 0 && text.length > 0) {
      chunks.push(text) // 元のテキストが短い場合
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i]
      // ここで実際のEmbedding API (OpenAI, Cohereなど) を呼び出してベクトルを生成する
      // 以下はダミーのベクトル生成
      const dummyEmbedding = new Array(768).fill(0).map(() => Math.random() * 2 - 1) // 例: 768次元のダミーベクトル

      const { error } = await supabase.from("document_embeddings").insert({
        document_id: documentId,
        chunk_index: i,
        chunk_text: chunkText,
        embedding_vector: dummyEmbedding, // 生成したベクトル
        // model_name: 'text-embedding-ada-002' // 使用したモデル名などメタデータ
      })
      if (error) {
        logOcr("ERROR", "ベクトルチャンク保存エラー", { documentId, chunkIndex: i, error: error.message })
        throw new Error(`ベクトルチャンク保存エラー: ${error.message}`)
      }
    }
    logOcr("INFO", "Groqインデックス作成完了（プレースホルダー）", { documentId, indexId, chunksCount: chunks.length })
    return indexId
  } catch (error) {
    logOcr("ERROR", "Groqインデックス作成エラー", { documentId, error })
    throw error
  }
}

// --- API Endpoint ---

export async function POST(request: NextRequest) {
  const requestId = `ocr_idx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  logOcr("INFO", "OCR・インデックス処理API開始", { requestId })

  try {
    const { documentIds, reprocess = false } = (await request.json()) as IndexRequestBody
    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      logOcr("ERROR", "無効なdocumentIds", { documentIds, requestId })
      return NextResponse.json(
        { success: false, error: "documentIdsは空でない配列である必要があります" },
        { status: 400 },
      )
    }
    logOcr("INFO", "処理対象文書", { documentIds, reprocess, requestId })

    const results = []
    for (const docId of documentIds) {
      let currentDbStatus = "unknown"
      try {
        logOcr("INFO", `文書処理開始: ${docId}`, { requestId })
        const { data: docData, error: fetchError } = await supabase
          .from("pdf_documents")
          .select("blob_url, status, ocr_text, file_name") // file_name を追加
          .eq("id", docId)
          .single()

        if (fetchError || !docData) {
          logOcr("ERROR", "文書情報取得失敗", { docId, fetchError, requestId })
          results.push({ documentId: docId, success: false, error: "文書が見つかりません" })
          continue
        }
        currentDbStatus = docData.status

        let ocrText = docData.ocr_text
        let aiDoc: AiDocument | undefined

        // OCR処理 (Google Document AI)
        if (reprocess || !ocrText || ["pending", "ocr_failed", "text_extraction_failed"].includes(currentDbStatus)) {
          await supabase
            .from("pdf_documents")
            .update({ status: "ocr_processing", error_message: null, indexing_error_message: null })
            .eq("id", docId)
          currentDbStatus = "ocr_processing"
          try {
            const aiResponse = await performOcrProcessing(docData.blob_url, docId)
            aiDoc = aiResponse.document
            ocrText = aiDoc.text
            if (!ocrText || ocrText.trim().length === 0) throw new Error("Document AIによるテキスト抽出結果が空です")

            // 構造化データ処理
            await processStructuredData(aiDoc, docId, docData.file_name) // file_name を渡す

            await supabase
              .from("pdf_documents")
              .update({
                ocr_text: ocrText,
                status: "text_extraction_completed", // 構造化データ処理も含むので、より適切なステータス名に変更も検討
                error_message: null,
                processed_at: new Date().toISOString(), // 処理完了日時
              })
              .eq("id", docId)
            currentDbStatus = "text_extraction_completed"
            logOcr("INFO", "Document AI処理・構造化データ保存完了", { docId, textLength: ocrText.length, requestId })
          } catch (ocrError: any) {
            logOcr("ERROR", "Document AI処理または構造化データ処理失敗", { docId, ocrError, requestId })
            await supabase
              .from("pdf_documents")
              .update({
                status: "ocr_failed", // または "data_processing_failed"
                error_message: ocrError.message || "不明なOCR/データ処理エラー",
              })
              .eq("id", docId)
            results.push({ documentId: docId, success: false, error: `処理失敗: ${ocrError.message}` })
            continue // この文書の処理は中断
          }
        }

        // Groqインデックス処理 (実際にはベクトル化と保存)
        if (ocrText && (reprocess || !["completed", "indexing_failed"].includes(currentDbStatus))) {
          // "indexing_failed" の場合も再処理対象とする
          await supabase
            .from("pdf_documents")
            .update({ status: "indexing_processing", indexing_error_message: null })
            .eq("id", docId)
          currentDbStatus = "indexing_processing"
          try {
            const groqIndexId = await createGroqIndex(ocrText, docId) // この関数はダミーのインデックスIDを返す
            await supabase
              .from("pdf_documents")
              .update({
                groq_index_id: groqIndexId, // ダミーのIDが保存される
                status: "completed",
                indexing_error_message: null,
                error_message: null, // 以前のエラーをクリア
              })
              .eq("id", docId)
            currentDbStatus = "completed"
            results.push({
              documentId: docId,
              success: true,
              message: "OCR、データ解析、およびインデックス化が完了しました",
              ocrTextLength: ocrText.length,
              groqIndexId,
            })
          } catch (indexError: any) {
            logOcr("ERROR", "インデックス処理失敗", { docId, indexError, requestId })
            await supabase
              .from("pdf_documents")
              .update({
                status: "indexing_failed",
                indexing_error_message: indexError.message || "不明なインデックス処理エラー",
              })
              .eq("id", docId)
            results.push({ documentId: docId, success: false, error: `インデックス処理失敗: ${indexError.message}` })
          }
        } else if (currentDbStatus === "completed" && !reprocess) {
          logOcr("INFO", "既に処理済み（スキップ）", { docId, requestId })
          results.push({ documentId: docId, success: true, message: "既に処理済みです" })
        } else if (!ocrText) {
          logOcr("ERROR", "OCRテキストが不足（インデックス処理スキップ）", { docId, currentDbStatus, requestId })
          results.push({
            documentId: docId,
            success: false,
            error: "OCRテキストが不足しているためインデックス処理をスキップしました",
          })
        } else {
          logOcr("INFO", "インデックス処理不要またはスキップ", { docId, currentDbStatus, reprocess, requestId })
          // 既にcompletedだがreprocess=trueでOCRのみ再処理した場合など
          results.push({
            documentId: docId,
            success: true,
            message: "OCR処理完了、インデックスは最新またはスキップされました",
          })
        }
      } catch (innerError: any) {
        logOcr("ERROR", `文書処理中の予期せぬエラー: ${docId}`, { innerError, currentDbStatus, requestId })
        // 不明なエラーの場合もステータスを更新
        await supabase
          .from("pdf_documents")
          .update({
            status: currentDbStatus.includes("ocr")
              ? "ocr_failed"
              : currentDbStatus.includes("index")
                ? "indexing_failed"
                : "processing_error",
            error_message: innerError.message || "不明な内部エラー",
          })
          .eq("id", docId)
          .catch((e) => logOcr("ERROR", "エラー状態のDB更新失敗", { docId, error: e }))

        results.push({ documentId: docId, success: false, error: innerError.message || "不明なエラーが発生しました" })
      }
    }

    const summary = {
      total: documentIds.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    }
    logOcr("INFO", "全文書処理完了", { requestId, summary, results })
    return NextResponse.json({ success: true, results, summary, requestId, timestamp: new Date().toISOString() })
  } catch (error: any) {
    logOcr("ERROR", "API処理中の致命的エラー", { requestId, error: error.message, stack: error.stack })
    return NextResponse.json(
      {
        success: false,
        error: "OCR・インデックス処理中に致命的なエラーが発生しました",
        details: error.message,
        requestId,
      },
      { status: 500 },
    )
  }
}
