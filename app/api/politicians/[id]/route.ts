import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // 政治家基本情報を取得
    const { data: politician, error: politicianError } = await supabase
      .from("politicians")
      .select("*")
      .eq("id", id)
      .single()

    if (politicianError || !politician) {
      return NextResponse.json({ success: false, error: "政治家が見つかりません" }, { status: 404 })
    }

    // 関連する資金フローデータを取得
    const { data: fundFlows } = await supabase
      .from("fund_flows")
      .select("*")
      .or(`from_entity.ilike.%${politician.name}%,to_entity.ilike.%${politician.name}%`)
      .order("date", { ascending: false })
      .limit(20)

    // 関連するPDF文書を取得
    const { data: pdfDocs } = await supabase
      .from("pdf_documents")
      .select("*")
      .or(`party_name.ilike.%${politician.party}%,region.ilike.%${politician.prefecture}%`)
      .order("created_at", { ascending: false })
      .limit(10)

    return NextResponse.json({
      success: true,
      data: {
        politician,
        fundFlows: fundFlows || [],
        pdfDocuments: pdfDocs || [],
        stats: {
          totalFundFlows: fundFlows?.length || 0,
          totalPdfDocs: pdfDocs?.length || 0,
        },
      },
    })
  } catch (error) {
    console.error("政治家詳細API エラー:", error)
    return NextResponse.json({ success: false, error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
