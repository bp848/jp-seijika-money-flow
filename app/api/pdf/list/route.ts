import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    console.log("📋 PDF一覧取得API開始...")

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const party = searchParams.get("party")
    const region = searchParams.get("region")
    const search = searchParams.get("search")

    console.log("🔍 検索パラメータ:", { page, limit, status, party, region, search })

    let query = supabase
      .from("pdf_documents")
      .select("*", { count: "exact" })
      .order("upload_datetime", { ascending: false })

    // フィルタリング
    if (status && status !== "all") {
      query = query.eq("status", status)
    }
    if (party && party !== "all") {
      query = query.eq("party_name", party)
    }
    if (region && region !== "all") {
      query = query.eq("region", region)
    }
    if (search) {
      query = query.ilike("file_name", `%${search}%`)
    }

    // ページネーション
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: documents, error, count } = await query

    if (error) {
      console.error("❌ データベースエラー:", error)
      return NextResponse.json(
        {
          success: false,
          error: "データベースエラーが発生しました",
          details: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    console.log(`✅ PDF一覧取得成功: ${documents?.length || 0}件 / 総数: ${count || 0}件`)

    return NextResponse.json({
      success: true,
      documents: documents || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("💥 PDF一覧取得中の致命的なエラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: "PDF一覧取得中に致命的なエラーが発生しました",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
