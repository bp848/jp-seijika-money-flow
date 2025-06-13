import { openai } from "@ai-sdk/openai"
import { streamText, type CoreMessage } from "ai"
import prisma from "@/lib/prisma"

export const runtime = "edge"

// 実装箇所: ユーザーの質問テキストをベクトル化する関数
async function getQueryEmbedding(query: string): Promise<number[]> {
  // この関数内で、質問文のベクトル化処理を実装します。
  // 例: const response = await openai.embeddings.create({ model: "text-embedding-ada-002", input: query }); return response.data[0].embedding;
  console.warn("getQueryEmbedding: 実際のベクトル生成処理が実装されていません。ダミーのベクトルを返します。")
  return Array(1536).fill(0.1) // OpenAI text-embedding-ada-002 の次元数に合わせたダミー
}

// 実装箇所: pgvectorを使用して類似チャンクを検索する関数
async function findRelevantChunks(
  embedding: number[],
  limit = 5,
): Promise<{ chunk_text: string; document_id: string }[]> {
  // この関数内で、Prismaとpgvectorを使用した類似度検索を実装します。
  // Prismaの $queryRawUnsafe や $queryRaw を使用する必要があります。
  // 例: const result = await prisma.$queryRaw`SELECT chunk_text, document_id FROM "DocumentEmbedding" ORDER BY embedding_vector <-> ${embedding}::vector LIMIT ${limit}`;
  // `embedding` はSQLインジェクションを防ぐために適切にエスケープまたはパラメータ化する必要があります。
  // pgvector拡張機能が有効で、DocumentEmbeddingテーブルにembedding_vectorカラム(vector型)が存在する必要があります。
  console.warn("findRelevantChunks: 実際のデータベース検索処理が実装されていません。ダミーのチャンク情報を返します。")
  return [
    { chunk_text: "関連情報チャンク1 (DBからの取得データ)", document_id: "dummy-doc-id-1" },
    { chunk_text: "関連情報チャンク2 (DBからの取得データ)", document_id: "dummy-doc-id-2" },
  ]
}

// 実装箇所: チャット履歴を保存する関数
async function saveChatMessage(
  sessionId: string | undefined,
  userMessage: string,
  assistantResponse: string,
  sourceDocuments?: any[],
): Promise<{ chatSessionId: string }> {
  let currentSessionId = sessionId

  if (!currentSessionId) {
    const newSession = await prisma.chatSession.create({
      data: {
        session_name: `Chat Session - ${new Date().toISOString()}`, // またはユーザー入力など
      },
    })
    currentSessionId = newSession.id
  }

  await prisma.chatMessage.createMany({
    data: [
      {
        session_id: currentSessionId,
        message_type: "user",
        content: userMessage,
      },
      {
        session_id: currentSessionId,
        message_type: "assistant",
        content: assistantResponse,
        source_documents: sourceDocuments && sourceDocuments.length > 0 ? sourceDocuments : undefined,
      },
    ],
  })
  return { chatSessionId: currentSessionId }
}

export async function POST(req: Request) {
  try {
    const { messages, sessionId: initialSessionId } = (await req.json()) as {
      messages: CoreMessage[]
      sessionId?: string
    }
    const userMessageContent = messages.findLast((m) => m.role === "user")?.content

    if (typeof userMessageContent !== "string") {
      return new Response("質問内容が文字列ではありません", { status: 400 })
    }

    const queryEmbedding = await getQueryEmbedding(userMessageContent)
    const relevantChunksData = await findRelevantChunks(queryEmbedding)

    const context = relevantChunksData.map((c) => c.chunk_text).join("\n\n")
    const sourceDocumentInfos = await prisma.pdfDocument.findMany({
      where: { id: { in: relevantChunksData.map((c) => c.document_id) } },
      select: { file_name: true, party_name: true, region: true, groq_index_id: true, blob_url: true },
    })

    const systemPrompt = `あなたは、提供された背景情報に基づいてユーザーの質問に答えるAIアシスタントです。
背景情報から回答が見つからない場合は、その旨を正直に伝えてください。憶測で答えないでください。
回答は日本語で行ってください。`

    const fullPromptMessages: CoreMessage[] = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `以下の背景情報を参照して、私の質問に答えてください。\n\n背景情報:\n${context}\n\n---\n質問: ${userMessageContent}`,
      },
    ]

    const result = await streamText({
      model: openai("gpt-4o"),
      messages: fullPromptMessages,
      async onFinish({ text, toolCalls, toolResults, usage, finishReason }) {
        // ストリーム完了後にチャット履歴を保存
        if (finishReason === "stop" || finishReason === "length") {
          if (userMessageContent && text) {
            // Ensure messages are not empty
            await saveChatMessage(initialSessionId, userMessageContent, text, sourceDocumentInfos)
          }
        }
      },
    })

    return result.toAIStreamResponse()
  } catch (error: any) {
    console.error("Chat API Error:", error)
    let errorMessage = "チャット処理中にエラーが発生しました。"
    if (error.message) {
      errorMessage += ` 詳細: ${error.message}`
    }
    if (error.cause) {
      errorMessage += ` 原因: ${JSON.stringify(error.cause)}`
    }
    return new Response(errorMessage, { status: 500 })
  }
}
