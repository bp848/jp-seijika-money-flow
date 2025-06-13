import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Supabase URL or Service Role Key is not defined")
  // Optionally, throw an error or handle this case appropriately
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""

    let query = supabase
      .from("politicians")
      .select("id", { count: "exact", head: true }) // Only need count
      .eq("status", "active")

    if (search) {
      // Apply search filter similar to the main politicians route
      // This searches across multiple relevant fields.
      // Ensure these fields exist in your 'politicians' table.
      const searchTerm = `%${search}%`
      query = query.or(
        `name.ilike.${searchTerm},name_kana.ilike.${searchTerm},party.ilike.${searchTerm},electoral_district.ilike.${searchTerm},prefecture.ilike.${searchTerm},legislature.ilike.${searchTerm}`,
      )
    }

    // Add other filters if they should affect the count, e.g., party, prefecture, legislature
    // For simplicity, this count route currently only considers the 'search' and 'status'
    // If your main /api/politicians route applies more filters by default that should affect the count,
    // those should be mirrored here. For example, if legislature filter is always applied.

    const { count, error } = await query

    if (error) {
      console.error("Error fetching politicians count:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch politicians count" }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: count || 0 })
  } catch (error) {
    console.error("API /politicians/count Error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
