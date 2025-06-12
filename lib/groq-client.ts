import Groq from "groq-sdk"

let groqClient: Groq | null = null

export function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw new Error("GROQ_API_KEY environment variable is not set")
    }
    groqClient = new Groq({
      apiKey: apiKey,
    })
  }
  return groqClient
}

export async function analyzeTextWithGroq(text: string): Promise<any> {
  try {
    const client = getGroqClient()

    const completion = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "あなたは政治資金収支報告書を分析する専門家です。提供されたテキストから構造化されたデータを抽出してください。",
        },
        {
          role: "user",
          content: `以下のテキストから政治資金に関する情報を抽出し、JSON形式で返してください：\n\n${text}`,
        },
      ],
      model: "llama3-8b-8192",
      temperature: 0.1,
      max_tokens: 1024,
    })

    return completion.choices[0]?.message?.content || null
  } catch (error) {
    console.error("Groq analysis error:", error)
    throw error
  }
}
