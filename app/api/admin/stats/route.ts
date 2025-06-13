import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // 実際のデータベースからの統計情報取得
    const [chatMessagesResponse, apiCallsResponse, activeUsersResponse, pdfDocumentsResponse] = await Promise.all([
      // AI応答数 (assistantメッセージの数)
      supabase
        .from("chat_messages")
        .select("count", { count: "exact" })
        .eq("message_type", "assistant"),

      // API呼び出し数 (system_logsテーブルから)
      supabase
        .from("system_logs")
        .select("count", { count: "exact" }),

      // アクティブユーザー数 (ユニークなセッション数)
      supabase
        .from("chat_sessions")
        .select("count", { count: "exact" }),

      // 処理済みデータ量 (PDF文書のサイズ合計)
      supabase
        .from("pdf_documents")
        .select("file_size")
        .eq("status", "completed"),
    ])

    // エラーチェック
    if (chatMessagesResponse.error) throw new Error(`AI応答数取得エラー: ${chatMessagesResponse.error.message}`)
    if (apiCallsResponse.error) throw new Error(`API呼び出し数取得エラー: ${apiCallsResponse.error.message}`)
    if (activeUsersResponse.error)
      throw new Error(`アクティブユーザー数取得エラー: ${activeUsersResponse.error.message}`)
    if (pdfDocumentsResponse.error) throw new Error(`PDF文書取得エラー: ${pdfDocumentsResponse.error.message}`)

    // データ処理量の計算 (バイト→MB→GB)
    const totalBytes = pdfDocumentsResponse.data.reduce((sum, doc) => sum + (doc.file_size || 0), 0)
    const totalMB = totalBytes / (1024 * 1024)
    const dataProcessed = totalMB >= 1024 ? `${(totalMB / 1024).toFixed(1)}GB` : `${totalMB.toFixed(1)}MB`

    // 統計情報の構築
    const stats = {
      aiResponses: chatMessagesResponse.count || 0,
      apiCalls: apiCallsResponse.count || 0,
      activeUsers: activeUsersResponse.count || 0,
      dataProcessed,
      // 前月比はダミーデータ（実際には前月のデータと比較する必要がある）
      change: {
        aiResponses: "+12%",
        apiCalls: "+8%",
        activeUsers: "+23%",
        dataProcessed: "+5%",
      },
    }

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("統計情報取得エラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "統計情報の取得に失敗しました",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
