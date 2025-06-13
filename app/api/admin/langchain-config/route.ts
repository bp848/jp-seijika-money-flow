import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // 最新の設定を取得
    const { data: logs, error } = await supabase
      .from("system_logs")
      .select("*")
      .eq("component", "ai-chat")
      .order("created_at", { ascending: false })
      .limit(1)

    // 環境変数から設定を取得
    const config = {
      model: process.env.LLM_MODEL || "llama-3.1-70b-versatile",
      temperature: Number.parseFloat(process.env.LLM_TEMPERATURE || "0.7"),
      maxTokens: Number.parseInt(process.env.LLM_MAX_TOKENS || "2048"),
      lastUpdate: logs && logs.length > 0 ? logs[0].created_at : new Date().toISOString(),
      status: "正常",
    }

    return NextResponse.json({
      success: true,
      config,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("LangChain設定取得エラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "LangChain設定の取得に失敗しました",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
