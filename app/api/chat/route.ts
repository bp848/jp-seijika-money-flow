// app/api/chat/route.ts
import { OpenAIStream, StreamingTextResponse } from "vercel/ai"
import type { NextRequest } from "next/server"
import OpenAI from "openai"

// OpenAIクライアントの初期化 (環境変数 OPENAI_API_KEY を自動的に使用)
const openai = new OpenAI()

export const runtime = "edge" // Edgeランタイム保証

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  })
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages) {
      return new Response("No messages provided", { status: 400, headers: corsHeaders })
    }

    // OpenAI APIへのリクエストを作成
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 必ずvercelがサポートするモデル
      stream: true,
      messages,
    })

    // OpenAIStreamを使用してレスポンスを変換
    const stream = OpenAIStream(response)

    // StreamingTextResponseでクライアントにストリームを返す
    return new StreamingTextResponse(stream, { headers: corsHeaders })
  } catch (error: any) {
    console.error("Chat API Error:", error)
    let errorMessage = "An internal error occurred"
    if (error instanceof OpenAI.APIError) {
      errorMessage = error.message
      return new Response(JSON.stringify({ error: errorMessage, details: error.type }), {
        status: error.status || 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }
    return new Response(JSON.stringify({ error: errorMessage, details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
}
