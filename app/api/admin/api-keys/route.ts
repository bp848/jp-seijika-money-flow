import { NextResponse } from "next/server"
import { supabaseAdmin as supabase } from "@/lib/supabase-client"

export async function GET() {
  try {
    // APIキーの状態を確認
    const apiKeys = [
      {
        name: "OpenAI API",
        status: process.env.OPENAI_API_KEY ? "active" : "inactive",
        lastUsed: await getLastUsedTime("openai"),
      },
      {
        name: "Groq API",
        status: process.env.GROQ_API_KEY ? "active" : "inactive",
        lastUsed: await getLastUsedTime("groq"),
      },
      {
        name: "Supabase",
        status: process.env.SUPABASE_SERVICE_ROLE_KEY ? "active" : "inactive",
        lastUsed: await getLastUsedTime("supabase"),
      },
      {
        name: "Vercel Blob",
        status: process.env.BLOB_READ_WRITE_TOKEN ? "active" : "inactive",
        lastUsed: await getLastUsedTime("blob"),
      },
    ]

    return NextResponse.json({
      success: true,
      keys: apiKeys,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("APIキー情報取得エラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "APIキー情報の取得に失敗しました",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// 最終使用時間を取得する関数
async function getLastUsedTime(component: string): Promise<string> {
  try {
    const { data } = await supabase
      .from("system_logs")
      .select("created_at")
      .ilike("message", `%${component}%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (data?.created_at) {
      // 現在時刻との差を計算
      const lastUsed = new Date(data.created_at)
      const now = new Date()
      const diffMs = now.getTime() - lastUsed.getTime()
      const diffMins = Math.floor(diffMs / 60000)

      if (diffMins < 60) {
        return `${diffMins}分前`
      } else if (diffMins < 1440) {
        return `${Math.floor(diffMins / 60)}時間前`
      } else {
        return `${Math.floor(diffMins / 1440)}日前`
      }
    }

    return "不明"
  } catch (error) {
    console.error(`${component}の最終使用時間取得エラー:`, error)
    return "不明"
  }
}
