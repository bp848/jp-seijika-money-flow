import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get("level")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const supabase = createClient()
    let query = supabase
      .from("system_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (level && level !== "all") {
      query = query.eq("level", level)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ logs: data || [] })
  } catch (error) {
    console.error("Failed to fetch system logs:", error)
    return NextResponse.json(
      { error: "Failed to fetch logs", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { level, message, component, metadata } = await request.json()

    const supabase = createClient()
    const { data, error } = await supabase
      .from("system_logs")
      .insert([
        {
          level,
          message,
          component,
          metadata: metadata || {},
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, log: data?.[0] })
  } catch (error) {
    console.error("Failed to create system log:", error)
    return NextResponse.json(
      { error: "Failed to create log", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
