import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)

    const transactionType = searchParams.get("transaction_type")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("fund_flows")
      .select(`
        id,
        amount,
        transaction_type,
        occurred_on,
        source_entity:source_entity_id(id, name),
        target_entity:target_entity_id(id, name)
      `)
      .order("occurred_on", { ascending: false })
      .range(offset, offset + limit - 1)

    if (transactionType && transactionType !== "all") {
      query = query.eq("transaction_type", transactionType)
    }

    const { data, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "データベースエラーが発生しました" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
