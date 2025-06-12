import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const sortColumn = searchParams.get("sortColumn") || "name"
    const sortOrder = searchParams.get("sortOrder") || "asc"

    // 政党データを取得（政治家テーブルから集計）
    let query = supabase
      .from("politicians")
      .select("party, count(*) as member_count", { count: "exact" })
      .eq("status", "active")
      .not("party", "is", null)
      .group("party")

    // 検索機能
    if (search) {
      query = query.ilike("party", `%${search}%`)
    }

    // ソート
    const validSortColumns = ["party", "member_count"]
    const safeColumn = validSortColumns.includes(sortColumn) ? sortColumn : "party"
    query = query.order(safeColumn, { ascending: sortOrder === "asc" })

    // ページネーション
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: partyData, error, count } = await query

    if (error) {
      console.error("政党データ取得エラー:", error)
      return NextResponse.json(
        {
          success: false,
          error: "政党データの取得に失敗しました",
        },
        { status: 500 },
      )
    }

    // 各政党の詳細情報を取得
    const partiesWithDetails = await Promise.all(
      (partyData || []).map(async (party) => {
        // 政党の代表的な議員情報を取得
        const { data: representatives } = await supabase
          .from("politicians")
          .select("name, position, legislature, electoral_district, photo_url")
          .eq("party", party.party)
          .eq("status", "active")
          .order("election_count", { ascending: false })
          .limit(3)

        // 議会別の議員数を取得
        const { data: legislatureBreakdown } = await supabase
          .from("politicians")
          .select("legislature, count(*)")
          .eq("party", party.party)
          .eq("status", "active")
          .group("legislature")

        return {
          name: party.party,
          member_count: party.member_count,
          representatives: representatives || [],
          legislature_breakdown: legislatureBreakdown || [],
        }
      }),
    )

    // 全体統計を取得
    const { data: totalStats } = await supabase.from("politicians").select("count(*)").eq("status", "active")

    const { data: legislatureStats } = await supabase
      .from("politicians")
      .select("legislature, count(*)")
      .eq("status", "active")
      .group("legislature")

    return NextResponse.json({
      success: true,
      data: partiesWithDetails,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
      stats: {
        total_politicians: totalStats?.[0]?.count || 0,
        legislature_breakdown: legislatureStats || [],
      },
    })
  } catch (error) {
    console.error("政党API エラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: "サーバーエラーが発生しました",
      },
      { status: 500 },
    )
  }
}
