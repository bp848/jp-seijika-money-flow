import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    // CSVデータを取得
    const csvUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/giin-zG8FOGvFP9zbjsbr0Bs97O1g5dkHYG.csv"
    const response = await fetch(csvUrl)

    if (!response.ok) {
      throw new Error(`CSV取得エラー: ${response.status}`)
    }

    const csvText = await response.text()
    const rows = csvText.split("\n")

    // ヘッダー行を取得
    const headers = rows[0].split(",")

    // データ行を処理
    const members = []
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue

      const values = rows[i].split(",")
      const member: Record<string, any> = {}

      headers.forEach((header, index) => {
        member[header] = values[index] ? values[index].trim() : null
      })

      members.push({
        name: member["議員氏名"],
        name_kana: member["読み方"],
        real_name: member["通称名使用議員の本名"] || null,
        party: member["会派"],
        electoral_district: member["選挙区"],
        term_end_date: member["任期満了"],
        photo_url: member["写真URL"],
        profile_url: member["議員個人の紹介ページ"],
        election_years: member["当選年"],
        election_count: Number.parseInt(member["当選回数"]) || 0,
        current_positions: member["役職等"],
        positions_as_of: member["役職等の時点"],
        biography: member["経歴"],
        biography_as_of: member["経歴の時点"],
        legislature: "house_of_councillors",
        status: "active",
      })
    }

    // 既存データを確認
    const { data: existingMembers } = await supabase
      .from("politicians")
      .select("name")
      .eq("legislature", "house_of_councillors")

    const existingNames = new Set(existingMembers?.map((m) => m.name) || [])

    // 新規データのみを挿入
    const newMembers = members.filter((m) => !existingNames.has(m.name))

    if (newMembers.length > 0) {
      const { data, error } = await supabase.from("politicians").insert(newMembers).select()

      if (error) {
        throw new Error(`データ挿入エラー: ${error.message}`)
      }

      return NextResponse.json({
        success: true,
        message: `${newMembers.length}件の参議院議員データをインポートしました`,
        insertedCount: newMembers.length,
        totalCount: members.length,
      })
    } else {
      return NextResponse.json({
        success: true,
        message: "新規データはありません",
        insertedCount: 0,
        totalCount: members.length,
      })
    }
  } catch (error) {
    console.error("参議院議員データインポートエラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: `インポートに失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      },
      { status: 500 },
    )
  }
}
