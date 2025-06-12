import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""
    const partyNameFilter = searchParams.get("party") || ""
    const prefecture = searchParams.get("prefecture") || ""
    const legislatureFilter = searchParams.get("legislature") || ""
    let sortColumn = searchParams.get("sortColumn") || "name"
    const sortOrder = searchParams.get("sortOrder") || "asc"

    let query = supabase.from("politicians").select(
      `
        *,
        political_parties(name), 
        party_branches(name) 
      `, // Changed political_parties!inner(name) to political_parties(name)
      { count: "exact" },
    )
    // .eq("status", "active") // Temporarily commented out to show all politicians regardless of status

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,name_kana.ilike.%${search}%,political_parties.name.ilike.%${search}%,elected_area.ilike.%${search}%,position.ilike.%${search}%`,
      )
    }

    if (partyNameFilter && partyNameFilter !== "all") {
      // Ensure this filter works with a left join; it might need to check if political_parties.name is null or matches
      query = query.eq("political_parties.name", partyNameFilter)
    }

    if (prefecture && prefecture !== "all") {
      query = query.eq("prefecture", prefecture)
    }

    if (legislatureFilter && legislatureFilter !== "all") {
      query = query.eq("legislature", legislatureFilter)
    }

    const validSortColumns: { [key: string]: string | { column: string; foreignTable: string } } = {
      name: "name",
      branch_name: { column: "name", foreignTable: "party_branches" },
      position: "position",
      elected_area: "elected_area",
      total_donations: "total_donations",
      total_expenditures: "total_expenditures",
      net_balance: "net_balance",
      party: { column: "name", foreignTable: "political_parties" },
    }

    let effectiveSortColumn = "name"
    let foreignTableOptions = {}

    if (validSortColumns[sortColumn]) {
      const sortConfig = validSortColumns[sortColumn]
      if (typeof sortConfig === "string") {
        effectiveSortColumn = sortConfig
      } else {
        effectiveSortColumn = sortConfig.column
        foreignTableOptions = { foreignTable: sortConfig.foreignTable }
      }
    } else {
      sortColumn = "name"
    }

    // @ts-ignore
    query = query.order(effectiveSortColumn, {
      ascending: sortOrder === "asc",
      ...foreignTableOptions,
    })

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: politiciansData, error, count } = await query

    if (error) {
      console.error("政治家データ取得エラー:", error.message)
      return NextResponse.json(
        {
          success: false,
          error: `政治家データの取得に失敗しました: ${error.message}`,
        },
        { status: 500 },
      )
    }

    const transformedPoliticians = politiciansData
      ? politiciansData.map((p: any) => ({
          ...p,
          party: p.political_parties?.name || "N/A",
          branch_name: p.party_branches?.name || "N/A",
          political_parties: undefined,
          party_branches: undefined,
        }))
      : []

    // --- Statistics Fetching (using RPC) ---
    // For stats, we might still want to consider the 'active' status or adjust the RPC functions accordingly.
    // For now, focusing on the main list.
    let partyStatsResult = []
    const { data: rpcPartyStats, error: rpcPartyStatsError } = await supabase.rpc("get_party_stats", {
      p_status: "active", // This RPC call still uses 'active'. If we want stats for all, this needs adjustment or a new RPC.
    })

    if (rpcPartyStatsError) {
      console.error("党派別統計取得エラー (RPC):", rpcPartyStatsError)
    } else if (rpcPartyStats) {
      const partyIds = rpcPartyStats
        .map((stat) => stat.party_id)
        .filter((id): id is number => id !== null && id !== undefined)
      if (partyIds.length > 0) {
        const { data: partiesData, error: partiesError } = await supabase
          .from("political_parties")
          .select("id, name")
          .in("id", partyIds)
        if (partiesError) console.error("党名取得エラー:", partiesError)
        else if (partiesData) {
          const partyMap = new Map(partiesData.map((pd) => [pd.id, pd.name]))
          partyStatsResult = rpcPartyStats.map((stat) => ({
            party: partyMap.get(stat.party_id) || `不明 (${stat.party_id})`,
            count: stat.count,
          }))
        }
      }
    }

    let legislatureStatsResult = []
    const { data: rpcLegislatureStats, error: rpcLegislatureStatsError } = await supabase.rpc(
      "get_legislature_stats",
      { p_status: "active" }, // This RPC call also still uses 'active'.
    )
    if (rpcLegislatureStatsError) console.error("議会種別統計取得エラー (RPC):", rpcLegislatureStatsError)
    else legislatureStatsResult = rpcLegislatureStats || []
    // --- End Statistics Fetching ---

    return NextResponse.json({
      success: true,
      data: transformedPoliticians,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
      stats: {
        parties: partyStatsResult,
        legislatures: legislatureStatsResult,
      },
    })
  } catch (error: any) {
    console.error("政治家API エラー:", error.message)
    return NextResponse.json(
      {
        success: false,
        error: `サーバーエラーが発生しました: ${error.message}`,
      },
      { status: 500 },
    )
  }
}
