import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { processSingleDocument } from "@/lib/pipeline/processor"

export const maxDuration = 60 // Vercel Pro plan allows up to 60s

export async function GET(request: Request) {
  // Simple auth check
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  console.log("Cron job started: Processing document queue.")

  // Fetch a small batch of documents to process
  const documentsToProcess = await prisma.pdfDocument.findMany({
    where: {
      OR: [{ status: "pending_upload" }, { status: "text_extraction_failed" }, { status: "indexing_failed" }],
    },
    take: 3, // Process 3 documents per cron run to stay within time limits
  })

  if (documentsToProcess.length === 0) {
    console.log("No documents to process in the queue.")
    return NextResponse.json({ success: true, message: "No documents to process." })
  }

  console.log(`Found ${documentsToProcess.length} documents to process.`)

  const results = await Promise.all(documentsToProcess.map((doc) => processSingleDocument(doc.id)))

  console.log("Cron job finished.")
  return NextResponse.json({ success: true, results })
}
