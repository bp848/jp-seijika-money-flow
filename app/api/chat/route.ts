import { OpenAIStream, StreamingTextResponse, type Message } from "ai"
// Use the standalone OpenAI SDK
import OpenAI from "openai"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Initialize the standalone OpenAI client (v4+)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
)

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: Message[] } = await req.json() // Use Message type from 'ai'

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400, headers: corsHeaders })
    }

    const lastUserMessageContent = messages[messages.length - 1]?.content
    if (typeof lastUserMessageContent !== "string") {
      return NextResponse.json({ error: "Invalid last message content" }, { status: 400, headers: corsHeaders })
    }

    // Asynchronously search for context from Supabase
    const [pdfDocs, fundFlows, politicians] = await Promise.all([
      supabase
        .from("pdf_documents")
        .select("title, content")
        .or(`content.ilike.%${lastUserMessageContent}%,title.ilike.%${lastUserMessageContent}%`)
        .limit(3),
      supabase
        .from("political_fund_flow")
        .select("purpose, recipient")
        .or(`purpose.ilike.%${lastUserMessageContent}%,recipient.ilike.%${lastUserMessageContent}%`)
        .limit(3),
      supabase
        .from("politicians")
        .select("name, party, position")
        .or(
          `name.ilike.%${lastUserMessageContent}%,name_kana.ilike.%${lastUserMessageContent}%,party.ilike.%${lastUserMessageContent}%`,
        )
        .limit(3),
    ])

    const context = `
      Context from PDF documents:
      ${(pdfDocs.data || []).map((doc) => `Title: ${doc.title}\nContent: ${doc.content.substring(0, 200)}...`).join("\n---\n")}

      Context from Political Fund Flows:
      ${(fundFlows.data || []).map((flow) => `Purpose: ${flow.purpose}, Recipient: ${flow.recipient}`).join("\n---\n")}

      Context from Politicians:
      ${(politicians.data || []).map((p) => `Name: ${p.name}, Party: ${p.party}, Position: ${p.position}`).join("\n---\n")}
    `

    const systemPromptMessage: Message = {
      role: "system",
      content: `
        You are an expert assistant specializing in Japanese political data.
        Answer the user's question based *only* on the provided context below.
        If the context does not contain the answer, state that you could not find the information.
        Do not use any prior knowledge.
        Context:
        ${context}
      `,
    }

    // Prepare messages for OpenAI API: system prompt first, then user/assistant messages
    const preparedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      systemPromptMessage,
      ...messages.map((msg) => ({ role: msg.role as "user" | "assistant", content: msg.content })),
    ]

    // Request the OpenAI API for a streaming chat completion
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: preparedMessages,
    })

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response)

    // Respond with the stream
    return new StreamingTextResponse(stream, { headers: corsHeaders })
  } catch (error: any) {
    console.error("Chat API Error:", error)
    let errorMessage = "An internal error occurred"
    let errorDetails = error.message
    if (error instanceof OpenAI.APIError) {
      errorMessage = error.name || "OpenAI API Error"
      errorDetails = `${error.status} ${error.type}: ${error.message}`
      console.error("OpenAI API Error Details:", errorDetails)
    }
    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: (error instanceof OpenAI.APIError && error.status) || 500, headers: corsHeaders },
    )
  }
}
