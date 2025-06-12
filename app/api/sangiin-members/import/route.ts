import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// CSVパース関数
function parseCSV(csvText: string) {
  const lines = csvText.split("\n")
  const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())

  const data = []
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(",").map((v) => v.replace(/"/g, "").trim())
      const record: any = {}
      headers.forEach((header, index) => {
        record[header] = values[index] || null
      })
      data.push(record)
    }
  }

  return data
}

// 日付パース関数
function parseDate(dateString: string): string | null {
  if (!dateString || dateString === "") return null

  try {
    // YYYY-MM-DD形式に変換
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return null
    return date.toISOString().split("T")[0]
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("参議院議員データインポート開始")

    // CSVデータを取得
    const csvUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/giin-zG8FOGvFP9zbjsbr0Bs97O1g5dkHYG.csv"
    const response = await fetch(csvUrl)
    const csvText = await response.text()

    console.log("CSVデータ取得完了")

    // CSVをパース
    const rawData = parseCSV(csvText)
    console.log(`パース完了: ${rawData.length}件のレコード`)

    // データを変換
    const transformedData = rawData.map((record) => ({
      name: record["議員氏名"],
      name_reading: record["読み方"],
      real_name: record["通称名使用議員の本名"] || null,
      profile_url: record["議員個人の紹介ページ"],
      party: record["会派"],
      electoral_district: record["選挙区"],
      term_end_date: parseDate(record["任期満了"]),
      photo_url: record["写真URL"],
      election_years: record["当選年"],
      election_count: record["当選回数"] ? Number.parseInt(record["当選回数"]) : null,
      current_positions: record["役職等"],
      positions_as_of: parseDate(record["役職等の時点"]),
      biography: record["経歴"],
      biography_as_of: parseDate(record["経歴の時点"]),
    }))

    console.log("データ変換完了")

    // 既存データを削除
    const { error: deleteError } = await supabase
      .from("sangiin_members")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000") // 全削除

    if (deleteError) {
      console.error("既存データ削除エラー:", deleteError)
    } else {
      console.log("既存データ削除完了")
    }

    // バッチでデータを挿入（1000件ずつ）
    const batchSize = 1000
    let insertedCount = 0

    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize)

      const { data, error } = await supabase.from("sangiin_members").insert(batch).select("id")

      if (error) {
        console.error(`バッチ ${Math.floor(i / batchSize) + 1} 挿入エラー:`, error)
        return NextResponse.json(
          {
            success: false,
            error: `データ挿入エラー: ${error.message}`,
            insertedCount,
          },
          { status: 500 },
        )
      }

      insertedCount += data?.length || 0
      console.log(`バッチ ${Math.floor(i / batchSize) + 1} 完了: ${data?.length}件挿入`)
    }

    // 統計情報を取得
    const { data: stats } = await supabase.from("sangiin_members").select("party, count(*)").group("party")

    console.log("インポート完了:", insertedCount, "件")

    return NextResponse.json({
      success: true,
      message: "参議院議員データのインポートが完了しました",
      insertedCount,
      totalRecords: transformedData.length,
      partyStats: stats || [],
    })
  } catch (error) {
    console.error("インポートエラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "不明なエラー",
      },
      { status: 500 },
    )
  }
}
