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
    const allowedSortColumns = [
      "name",
      "affiliated_party",
      "representative_name",
      "treasurer_name",
      "address",
      "registered_on",
    ]
    const safeSortColumn = allowedSortColumns.includes(sortColumn) ? sortColumn : "name"

    let query = supabase.from("political_funds").select("*", { count: "exact" })

    // 検索機能
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,affiliated_party.ilike.%${search}%,representative_name.ilike.%${search}%,treasurer_name.ilike.%${search}%`,
      )
    }

    // ソート
    query = query.order(safeSortColumn, { ascending: sortOrder === "asc" })

    // ページネーション
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error("Political funds API error:", error)
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
    console.error("Political funds API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
