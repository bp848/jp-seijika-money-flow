import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const party = searchParams.get("party") || ""
    const district = searchParams.get("district") || ""
    const sortColumn = searchParams.get("sortColumn") || "name"
    const sortOrder = searchParams.get("sortOrder") || "asc"

    // ベースクエリ
    let query = supabase.from("sangiin_members").select("*", { count: "exact" })

    // 検索フィルター
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,name_reading.ilike.%${search}%,party.ilike.%${search}%,electoral_district.ilike.%${search}%`,
      )
    }

    // 会派フィルター
    if (party && party !== "all") {
      query = query.eq("party", party)
    }

    // 選挙区フィルター
    if (district && district !== "all") {
      query = query.eq("electoral_district", district)
    }

    // ソート
    const validSortColumns = ["name", "party", "electoral_district", "election_count", "term_end_date"]
    const safeColumn = validSortColumns.includes(sortColumn) ? sortColumn : "name"
    query = query.order(safeColumn, { ascending: sortOrder === "asc" })

    // ページネーション
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: members, error, count } = await query

    if (error) {
      console.error("参議院議員データ取得エラー:", error)
      return NextResponse.json(
        {
          success: false,
          error: "参議院議員データの取得に失敗しました",
        },
        { status: 500 },
      )
    }

    // 統計情報も取得
    const { data: partyStats } = await supabase
      .from("sangiin_members")
      .select("party, count(*)")
      .group("party")
      .order("count", { ascending: false })

    const { data: districtStats } = await supabase
      .from("sangiin_members")
      .select("electoral_district, count(*)")
      .group("electoral_district")
      .order("count", { ascending: false })

    return NextResponse.json({
      success: true,
      data: members || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
      stats: {
        parties: partyStats || [],
        districts: districtStats || [],
      },
    })
  } catch (error) {
    console.error("参議院議員API エラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: "サーバーエラーが発生しました",
      },
      { status: 500 },
    )
  }
}
