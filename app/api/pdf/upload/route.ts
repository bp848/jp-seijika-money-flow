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
        data: data ? JSON.stringify(data) : null, // `metadata` から `data` へ、スキーマに合わせる
        created_at: new Date().toISOString(), // `timestamp` から `created_at` へ
        // file_name, process_id なども必要に応じて設定
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
      // 50MB
      logUpload("ERROR", "ファイルサイズ超過", { fileSize: file.size })
      return NextResponse.json({ error: "ファイルサイズは50MB以下にしてください" }, { status: 400 })
    }

    logUpload("INFO", "ファイル検証完了", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })

    // 重複チェック（ファイル名のみで判定）
    const { data: existingFiles, error: checkError } = await supabase
      .from("pdf_documents")
      .select("id, file_name, file_size, upload_datetime, status")
      .eq("file_name", file.name)
      .limit(1)

    if (checkError) {
      logUpload("ERROR", "重複チェック時のDBエラー", checkError)
      // エラーがあっても処理を続行（重複チェックの失敗は致命的ではない場合もある）
    } else if (existingFiles && existingFiles.length > 0) {
      const existingFile = existingFiles[0]
      logUpload("INFO", "重複ファイル検出", { existingFile })
      return NextResponse.json({
        success: true,
        isDuplicate: true,
        message: "同じファイル名のファイルが既にアップロードされています",
        file: {
          id: existingFile.id,
          fileName: existingFile.file_name,
          uploadDate: existingFile.upload_datetime,
          status: existingFile.status || "unknown",
          canReprocess: ["error", "ocr_failed", "indexing_failed", "completed"].includes(existingFile.status || ""),
        },
      })
    }

    // Vercel Blobにアップロード
    logUpload("INFO", "Blobアップロード開始")
    let blob
    try {
      blob = await put(file.name, file, {
        access: "public",
        contentType: file.type, // Add content type
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
    const fileNameLower = file.name.toLowerCase()
    let partyName = "不明"
    let region = "不明"

    const partyKeywords: { [key: string]: string } = {
      自民: "自由民主党",
      自由民主: "自由民主党",
      立憲: "立憲民主党",
      立民: "立憲民主党",
      公明: "公明党",
      維新: "日本維新の会",
      共産: "日本共産党",
      国民民主: "国民民主党",
      れいわ: "れいわ新選組",
      社民: "社会民主党",
      nhk: "NHK党", // 正式名称に応じて調整
    }
    for (const keyword in partyKeywords) {
      if (fileNameLower.includes(keyword)) {
        partyName = partyKeywords[keyword]
        break
      }
    }

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
      if (fileNameLower.includes(r.toLowerCase())) {
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
      status: "pending", // 初期ステータス
      upload_datetime: new Date().toISOString(),
      // ocr_text, groq_index_idなどは後続処理で設定
    }

    const { data: dbData, error: dbError } = await supabase.from("pdf_documents").insert(documentData).select().single()

    if (dbError) {
      logUpload("ERROR", "データベース保存エラー", { error: dbError, documentData })
      if (dbError.code === "23505") {
        // Unique constraint violation
        logUpload("INFO", "DB重複エラー - 既存レコード検索")
        const { data: existingRecord } = await supabase
          .from("pdf_documents")
          .select("*")
          .eq("file_name", file.name) // Or a more robust unique identifier if available
          .single()
        if (existingRecord) {
          return NextResponse.json({
            success: true,
            isDuplicate: true,
            message: "同じファイルが既にデータベースに存在します（ユニーク制約違反）",
            file: {
              id: existingRecord.id,
              fileName: existingRecord.file_name,
              uploadDate: existingRecord.upload_datetime,
              status: existingRecord.status,
            },
          })
        }
      }
      return NextResponse.json({ error: "ファイル情報の保存に失敗しました", details: dbError.message }, { status: 500 })
    }

    logUpload("INFO", "データベース保存完了", { documentId: dbData.id })

    // OCR処理を自動開始（非同期でindex APIを呼び出す）
    logUpload("INFO", "OCR処理自動開始準備", { documentId: dbData.id })
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/pdf/index`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentIds: [dbData.id], reprocess: false }), // 初期処理なのでreprocessはfalse
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorResult = await res.json().catch(() => ({}))
          logUpload("ERROR", "OCR処理API呼び出し失敗", { status: res.status, documentId: dbData.id, errorResult })
        } else {
          const result = await res.json().catch(() => ({}))
          logUpload("INFO", "OCR処理API呼び出し成功", { documentId: dbData.id, result })
        }
      })
      .catch((ocrError) => {
        logUpload("ERROR", "OCR処理API呼び出し中の例外", { documentId: dbData.id, ocrError })
      })

    logUpload("INFO", "アップロード処理完了、OCR処理をバックグラウンドで開始", {
      uploadId,
      documentId: dbData.id,
      fileName: file.name,
    })

    return NextResponse.json({
      success: true,
      isDuplicate: false,
      message: "ファイルのアップロードが完了しました。OCRおよびデータ解析処理をバックグラウンドで開始します。",
      file: {
        id: dbData.id,
        fileName: dbData.file_name,
        fileUrl: dbData.blob_url,
        fileSize: dbData.file_size,
        partyName: dbData.party_name,
        region: dbData.region,
        status: dbData.status, // 'pending'
        uploadDate: dbData.upload_datetime,
      },
    })
  } catch (error) {
    logUpload("ERROR", "アップロード処理中の致命的エラー", error)
    return NextResponse.json(
      {
        error: "ファイルアップロード中に予期せぬエラーが発生しました",
        details: error instanceof Error ? error.message : "不明なエラー",
        uploadId,
      },
      { status: 500 },
    )
  }
}
