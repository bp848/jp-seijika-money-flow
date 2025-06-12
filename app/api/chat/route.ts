import { streamText, type CoreMessage } from "ai"
import { openai as openaiProvider } from "@ai-sdk/openai" // Using the OpenAI provider from AI SDK
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Initialize the Supabase client (remains the same)
const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json()

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400, headers: corsHeaders })
    }

    const lastUserMessageContent = messages[messages.length - 1]?.content
    if (typeof lastUserMessageContent !== "string") {
      return NextResponse.json({ error: "Invalid last message content" }, { status: 400, headers: corsHeaders })
    }

    // Asynchronously search for context from Supabase (remains the same)
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

    const systemPrompt: CoreMessage = {
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

    // Use the AI SDK's streamText function
    const result = await streamText({
      model: openaiProvider("gpt-4o-mini"), // Using the OpenAI provider instance
      messages: [systemPrompt, ...messages], // Pass CoreMessage array
      // Optional: add other parameters like temperature, maxTokens, etc.
      // temperature: 0.7,
      // maxTokens: 1000,
    })

    // Respond with the stream using StreamingTextResponse
    return result.toAIStreamResponse({ headers: corsHeaders })
  } catch (error: any) {
    console.error("Chat API Error:", error)
    let errorMessage = "An internal error occurred"
    let errorDetails = error.message
    // Check if it's an error from the AI SDK or OpenAI directly
    if (error.name === "AIError" || error.constructor?.name === "APIError") {
      // Heuristic for AI SDK or OpenAI errors
      errorMessage = error.name || "AI SDK Error"
      errorDetails = `${error.status || ""} ${error.type || ""}: ${error.message}`
      console.error("AI SDK/API Error Details:", errorDetails)
    }
    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: error.status || 500, headers: corsHeaders },
    )
  }
}
