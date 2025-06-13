import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const sortColumn = searchParams.get("sortColumn") || "name"
    const sortOrder = searchParams.get("sortOrder") || "asc"

    // 安全なソートカラムの検証
    const allowedSortColumns = ["name", "representative_name", "treasurer_name", "branch_address", "registered_on"]
    const safeSortColumn = allowedSortColumns.includes(sortColumn) ? sortColumn : "name"

    let query = supabase.from("party_branches").select(
      `
        *,
        political_parties!inner(name)
      `,
      { count: "exact" },
    )

    // 検索機能の修正
    if (search) {
      // 1. 検索語に一致する政党のIDを先に取得
      const { data: matchingParties } = await supabase
        .from("political_parties")
        .select("id")
        .ilike("name", `%${search}%`)

      const matchingPartyIds = matchingParties ? matchingParties.map((p) => p.id) : []

      // 2. OR条件を構築
      const orFilters = [
        `name.ilike.%${search}%`,
        `representative_name.ilike.%${search}%`,
        `treasurer_name.ilike.%${search}%`,
      ]

      // 3. 一致した政党IDがあれば、OR条件に追加
      if (matchingPartyIds.length > 0) {
        orFilters.push(`party_id.in.(${matchingPartyIds.join(",")})`)
      }

      query = query.or(orFilters.join(","))
    }

    // ソート
    query = query.order(safeSortColumn, { ascending: sortOrder === "asc" })

    // ページネーション
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error("Party branches API error:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
    })
  } catch (error) {
    console.error("Party branches API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
