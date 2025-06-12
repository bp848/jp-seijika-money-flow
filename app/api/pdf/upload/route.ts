import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createClient } from "@supabase/supabase-js"

// Supabaseクライアントの初期化
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// 詳細ログ機能
function logUpload(level: "INFO" | "ERROR" | "DEBUG", message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logEntry = `[${timestamp}] UPLOAD-${level}: ${message} ${data ? JSON.stringify(data) : ""}`
  console.log(logEntry)

  // DBにもログを保存
  try {
    supabase
      .from("system_logs")
      .insert({
        level: level.toLowerCase(),
        component: "pdf-upload",
        message,
        data: data ? JSON.stringify(data) : null,
        created_at: new Date().toISOString(),
      })
      .then(() => {})
      .catch((err) => console.error("ログ保存エラー:", err))
  } catch (e) {
    console.error("ログ保存中のエラー:", e)
  }

  return logEntry
}

export async function POST(request: NextRequest) {
  const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  logUpload("INFO", "PDFアップロード開始", { uploadId })

  try {
    // 環境変数チェック
    const requiredEnvVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    }

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key)

    if (missingVars.length > 0) {
      logUpload("ERROR", "環境変数不足", { missingVars })
      return NextResponse.json({ error: `環境変数が設定されていません: ${missingVars.join(", ")}` }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      logUpload("ERROR", "ファイルが提供されていません")
      return NextResponse.json({ error: "ファイルを選択してください" }, { status: 400 })
    }

    // ファイル検証
    if (file.type !== "application/pdf") {
      logUpload("ERROR", "無効なファイル形式", { fileType: file.type })
      return NextResponse.json({ error: "PDFファイルのみアップロード可能です" }, { status: 400 })
    }

    if (file.size > 50 * 1024 * 1024) {
      logUpload("ERROR", "ファイルサイズ超過", { fileSize: file.size })
      return NextResponse.json({ error: "ファイルサイズは50MB以下にしてください" }, { status: 400 })
    }

    logUpload("INFO", "ファイル検証完了", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })

    // 重複チェック（ファイル名のみで判定）- 厳密な重複チェックは後で実装
    const { data: existingFiles, error: checkError } = await supabase
      .from("pdf_documents")
      .select("id, file_name, file_size, upload_datetime, status")
      .eq("file_name", file.name)
      .limit(1)

    if (checkError) {
      logUpload("ERROR", "重複チェック時のDBエラー", checkError)
      // エラーがあっても処理を続行（重複チェックの失敗は致命的ではない）
    } else if (existingFiles && existingFiles.length > 0) {
      const existingFile = existingFiles[0]
      logUpload("INFO", "重複ファイル検出", { existingFile })

      // 重複ファイルの処理状況を確認
      return NextResponse.json({
        success: true,
        isDuplicate: true,
        message: "同じファイル名のファイルが既にアップロードされています",
        file: {
          id: existingFile.id,
          fileName: existingFile.file_name,
          uploadDate: existingFile.upload_datetime,
          status: existingFile.status || "unknown",
          canReprocess:
            existingFile.status === "error" ||
            existingFile.status === "ocr_failed" ||
            existingFile.status === "indexing_failed",
        },
      })
    }

    // Vercel Blobにアップロード
    logUpload("INFO", "Blobアップロード開始")
    let blob
    try {
      blob = await put(file.name, file, {
        access: "public",
      })
      logUpload("INFO", "Blobアップロード完了", { blobUrl: blob.url })
    } catch (blobError) {
      logUpload("ERROR", "Blobアップロード失敗", blobError)
      return NextResponse.json(
        {
          error: "ファイルのストレージへのアップロードに失敗しました",
          details: blobError instanceof Error ? blobError.message : "不明なエラー",
        },
        { status: 500 },
      )
    }

    // ファイル名から政党名と地域を推定（簡易版）
    const fileName = file.name.toLowerCase()
    let partyName = "不明"
    let region = "不明"

    // 政党名推定
    if (fileName.includes("自民") || fileName.includes("自由民主")) partyName = "自由民主党"
    else if (fileName.includes("立憲") || fileName.includes("立民")) partyName = "立憲民主党"
    else if (fileName.includes("公明")) partyName = "公明党"
    else if (fileName.includes("維新")) partyName = "日本維新の会"
    else if (fileName.includes("共産")) partyName = "日本共産党"
    else if (fileName.includes("国民民主")) partyName = "国民民主党"

    // 地域推定
    const regions = [
      "北海道",
      "青森",
      "岩手",
      "宮城",
      "秋田",
      "山形",
      "福島",
      "茨城",
      "栃木",
      "群馬",
      "埼玉",
      "千葉",
      "東京",
      "神奈川",
      "新潟",
      "富山",
      "石川",
      "福井",
      "山梨",
      "長野",
      "岐阜",
      "静岡",
      "愛知",
      "三重",
      "滋賀",
      "京都",
      "大阪",
      "兵庫",
      "奈良",
      "和歌山",
      "鳥取",
      "島根",
      "岡山",
      "広島",
      "山口",
      "徳島",
      "香川",
      "愛媛",
      "高知",
      "福岡",
      "佐賀",
      "長崎",
      "熊本",
      "大分",
      "宮崎",
      "鹿児島",
      "沖縄",
    ]

    for (const r of regions) {
      if (fileName.includes(r)) {
        region = r
        break
      }
    }

    // データベースに保存
    logUpload("INFO", "データベース保存開始", { fileName: file.name, blobUrl: blob.url })

    const documentData = {
      file_name: file.name,
      blob_url: blob.url,
      file_size: file.size,
      party_name: partyName,
      region: region,
      status: "pending",
      upload_datetime: new Date().toISOString(),
    }

    const { data: dbData, error: dbError } = await supabase.from("pdf_documents").insert(documentData).select().single()

    if (dbError) {
      logUpload("ERROR", "データベース保存エラー", { error: dbError, documentData })

      // 重複エラーの場合の特別処理
      if (dbError.code === "23505") {
        logUpload("INFO", "DB重複エラー - 既存レコード検索")
        const { data: existingRecord } = await supabase
          .from("pdf_documents")
          .select("*")
          .eq("file_name", file.name)
          .single()

        if (existingRecord) {
          return NextResponse.json({
            success: true,
            isDuplicate: true,
            message: "同じファイルが既にアップロードされています",
            file: {
              id: existingRecord.id,
              fileName: existingRecord.file_name,
              uploadDate: existingRecord.upload_datetime,
              status: existingRecord.status,
            },
          })
        }
      }

      return NextResponse.json(
        {
          error: "ファイル情報の保存に失敗しました",
          details: dbError.message,
        },
        { status: 500 },
      )
    }

    logUpload("INFO", "データベース保存完了", { documentId: dbData.id })

    // OCR処理を自動開始（非同期）
    logUpload("INFO", "OCR処理自動開始準備")

    // 実際にOCR処理を開始するAPIを呼び出す
    try {
      const ocrResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/pdf/index`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentIds: [dbData.id],
          reprocess: false,
        }),
      })

      const ocrResult = await ocrResponse.json()
      logUpload("INFO", "OCR処理開始結果", ocrResult)

      // OCR処理の開始に成功したかどうかに関わらず、アップロード自体は成功として扱う
    } catch (ocrError) {
      logUpload("ERROR", "OCR処理開始失敗", ocrError)
      // OCR処理の開始に失敗しても、アップロード自体は成功として扱う
    }

    logUpload("INFO", "アップロード処理完了", {
      uploadId,
      documentId: dbData.id,
      fileName: file.name,
    })

    return NextResponse.json({
      success: true,
      isDuplicate: false,
      message: "ファイルのアップロードが完了しました。OCR処理を開始します。",
      file: {
        id: dbData.id,
        fileName: dbData.file_name,
        fileUrl: dbData.blob_url,
        fileSize: dbData.file_size,
        partyName: dbData.party_name,
        region: dbData.region,
        status: dbData.status,
        uploadDate: dbData.upload_datetime,
      },
    })
  } catch (error) {
    logUpload("ERROR", "アップロード処理中の致命的エラー", error)
    return NextResponse.json(
      {
        error: "ファイルアップロード中にエラーが発生しました",
        details: error instanceof Error ? error.message : "不明なエラー",
        uploadId,
      },
      { status: 500 },
    )
  }
}
