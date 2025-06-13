import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // システムヘルスの取得
    const [dbResponse, apiResponse] = await Promise.all([
      // データベース接続テスト
      supabase
        .from("system_logs")
        .select("count", { count: "exact" })
        .limit(1),

      // API応答時間テスト
      testApiResponseTime(),
    ])

    // CPU使用率（モック）
    const cpuUsage = Math.floor(Math.random() * 30) + 20 // 20-50%

    // メモリ使用率（モック）
    const memoryUsage = Math.floor(Math.random() * 40) + 30 // 30-70%

    // ストレージ使用率（PDFドキュメントの合計サイズ）
    const storageUsage = await getStorageUsage()

    // API応答時間
    const apiResponseTime = apiResponse

    const health = [
      {
        component: "CPU使用率",
        value: `${cpuUsage}%`,
        status: cpuUsage > 90 ? "critical" : cpuUsage > 70 ? "warning" : "normal",
        icon: "Cpu",
      },
      {
        component: "メモリ使用率",
        value: `${memoryUsage}%`,
        status: memoryUsage > 90 ? "critical" : memoryUsage > 70 ? "warning" : "normal",
        icon: "MemoryStick",
      },
      {
        component: "ストレージ",
        value: `${storageUsage}%`,
        status: storageUsage > 90 ? "critical" : storageUsage > 70 ? "warning" : "normal",
        icon: "HardDrive",
      },
      {
        component: "応答時間",
        value: `${apiResponseTime}ms`,
        status: apiResponseTime > 500 ? "critical" : apiResponseTime > 200 ? "warning" : "normal",
        icon: "Clock",
      },
    ]

    return NextResponse.json({
      success: true,
      health,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("システムヘルス取得エラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "システムヘルス情報の取得に失敗しました",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// ストレージ使用率を取得（PDFドキュメントの合計サイズ）
async function getStorageUsage(): Promise<number> {
  try {
    const { data, error } = await supabase.from("pdf_documents").select("file_size")

    if (error) throw error

    // 合計サイズを計算
    const totalSize = data.reduce((sum, doc) => sum + (doc.file_size || 0), 0)

    // 仮の最大容量（10GB）に対する使用率
    const maxStorage = 10 * 1024 * 1024 * 1024 // 10GB
    return Math.round((totalSize / maxStorage) * 100)
  } catch (error) {
    console.error("ストレージ使用率取得エラー:", error)
    return 0
  }
}

// API応答時間をテスト
async function testApiResponseTime(): Promise<number> {
  try {
    const start = Date.now()
    await supabase.from("system_logs").select("count", { count: "exact" }).limit(1)
    return Date.now() - start
  } catch (error) {
    console.error("API応答時間テストエラー:", error)
    return 0
  }
}
