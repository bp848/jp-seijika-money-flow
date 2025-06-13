import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

interface HealthStatus {
  status: "healthy" | "error" | "unknown"
  message: string
  timestamp: string
}

interface HealthCheckResult {
  database: HealthStatus
  groq: HealthStatus
  environment: HealthStatus
}

export async function POST() {
  const timestamp = new Date().toISOString()

  const result: HealthCheckResult = {
    database: { status: "unknown", message: "チェック中...", timestamp },
    groq: { status: "unknown", message: "チェック中...", timestamp },
    environment: { status: "unknown", message: "チェック中...", timestamp },
  }

  // データベース接続確認
  try {
    const { data, error } = await supabase.from("pdf_documents").select("count").limit(1)

    if (error) {
      result.database = {
        status: "error",
        message: `データベース接続エラー: ${error.message}`,
        timestamp,
      }
    } else {
      result.database = {
        status: "healthy",
        message: "データベース接続正常",
        timestamp,
      }
    }
  } catch (error) {
    result.database = {
      status: "error",
      message: `データベース例外: ${error instanceof Error ? error.message : "不明なエラー"}`,
      timestamp,
    }
  }

  // Groq API接続確認
  try {
    if (!process.env.GROQ_API_KEY) {
      result.groq = {
        status: "error",
        message: "GROQ_API_KEY環境変数が設定されていません",
        timestamp,
      }
    } else {
      const response = await fetch("https://api.groq.com/openai/v1/models", {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      })

      if (response.ok) {
        result.groq = {
          status: "healthy",
          message: "Groq API接続正常",
          timestamp,
        }
      } else {
        result.groq = {
          status: "error",
          message: `Groq API接続エラー: ${response.status} ${response.statusText}`,
          timestamp,
        }
      }
    }
  } catch (error) {
    result.groq = {
      status: "error",
      message: `Groq API例外: ${error instanceof Error ? error.message : "不明なエラー"}`,
      timestamp,
    }
  }

  // 環境変数確認
  const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "GROQ_API_KEY"]

  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

  if (missingEnvVars.length === 0) {
    result.environment = {
      status: "healthy",
      message: "全ての必要な環境変数が設定されています",
      timestamp,
    }
  } else {
    result.environment = {
      status: "error",
      message: `不足している環境変数: ${missingEnvVars.join(", ")}`,
      timestamp,
    }
  }

  // ヘルスチェック結果をログに記録
  try {
    await supabase.from("system_logs").insert({
      level: "info",
      message: "システムヘルスチェック実行",
      data: result,
      created_at: timestamp,
    })
  } catch (error) {
    console.error("ヘルスチェックログ保存エラー:", error)
  }

  return NextResponse.json({
    success: true,
    healthStatus: result,
    timestamp,
  })
}
