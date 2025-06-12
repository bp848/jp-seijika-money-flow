import { NextResponse } from "next/server"
import { supabaseService } from "@/lib/supabase-client"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10)
    const politicianId = searchParams.get("politicianId")
      ? Number.parseInt(searchParams.get("politicianId")!, 10)
      : undefined
    const search = searchParams.get("search") || undefined
    const officeType = searchParams.get("officeType") || undefined
    const reportYear = searchParams.get("reportYear") ? Number.parseInt(searchParams.get("reportYear")!, 10) : undefined
    const jurisdiction = searchParams.get("jurisdiction") || undefined
    const isActiveParam = searchParams.get("isActive")
    const isActive = isActiveParam === null ? undefined : isActiveParam === "true"

    const { data, count, error } = await supabaseService.getFundManagementOrganizations({
      page,
      limit,
      politicianId,
      search,
      officeType,
      reportYear,
      jurisdiction,
      isActive,
    })

    if (error) {
      console.error("Error fetching fund management organizations:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, count })
  } catch (e: any) {
    console.error("Unexpected error in API route:", e)
    return NextResponse.json({ error: e.message || "An unexpected error occurred" }, { status: 500 })
  }
}
