import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import type { Status } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const statusParam = searchParams.get("status")
    const party = searchParams.get("party")
    const region = searchParams.get("region")

    const where: any = {}
    if (statusParam && statusParam !== "all" && Object.values(prisma.Status).includes(statusParam as Status)) {
      where.status = statusParam as Status
    }
    if (party && party !== "all") where.party_name = party
    if (region && region !== "all") where.region = region

    const total = await prisma.pdfDocument.count({ where })
    const documents = await prisma.pdfDocument.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        upload_datetime: "desc",
      },
    })

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("List PDFs API Error:", error)
    return NextResponse.json(
      { error: "一覧の取得に失敗しました", code: "LIST_FETCH_FAILED", details: error.message },
      { status: 500 },
    )
  }
}
