// Supabase クライアントのユーティリティ関数
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { FundManagementOrganization } from "@/types" // この型は現状このファイルでは直接使われていないが、元のファイル構造を維持

// Re-export createClient for external use
export { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error("CRITICAL ERROR: NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables.")
  // 本番環境では、ここでエラーを投げてもUI上はSupabaseClientの内部エラーになることが多い
  // しかし、開発時には明確なエラーとして認識できる
}
if (!supabaseAnonKey) {
  console.error("CRITICAL ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in environment variables.")
}

// supabaseUrl と supabaseAnonKey が undefined の場合、createClient は内部でエラーを投げる
// 'supabaseKey is required' は supabaseAnonKey が渡されなかった場合のエラー
export const supabase: SupabaseClient = createClient(supabaseUrl!, supabaseAnonKey!)

export const supabaseAdmin = (() => {
  const adminSupabaseUrl = process.env.SUPABASE_URL // サーバーサイド用は NEXT_PUBLIC なし
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!adminSupabaseUrl || !supabaseServiceKey) {
    console.warn(
      "Admin Supabase client (supabaseAdmin) could not be initialized due to missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. This may affect server-side operations.",
    )
    // null を返すか、限定的なクライアントを返すか、あるいはエラーを投げるかは設計次第
    // ここでは、初期化失敗を示すために限定的なオブジェクトやnullを返すことを検討できるが、
    // createClientがURL/Keyなしで呼ばれるとエラーになるため、呼び出し側でケアが必要。
    // 安全のため、未定義の場合はエラーを投げるか、機能しないダミークライアントを返す。
    // ここでは、呼び出し元でエラーが発生するように、不完全なキーで初期化しようとせず、
    // supabase インスタンスとは別に扱うことを明確にする。
    // もし adminSupabaseUrl と supabaseServiceKey がなければ、supabaseAdmin は使えない。
    // 簡単のため、ここではエラーを出すのではなく、利用箇所で問題が出るようにする。
    // より堅牢にするなら、ここでエラーを投げる。
    return createClient(adminSupabaseUrl || "http://localhost:54321", supabaseServiceKey || "dummykey") // ダミーキーで初期化するとエラーになる
  }
  return createClient(adminSupabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
})()

// Client-side client (with anon key) - supabase としてエクスポート済み
export const supabaseClient = supabase // supabase を supabaseClient としてもエクスポート

export default supabase // デフォルトエクスポートも supabase

// PDF Documents related functions
export interface PdfDocument {
  id: string
  file_name: string
  blob_url: string
  upload_datetime: string
  party_name: string
  region: string
  status: string
  error_message?: string
  indexing_error_message?: string
  file_size: number
  groq_index_id?: string
  ocr_text?: string
}

export interface ChatSession {
  id: string
  session_name: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  message_type: "user" | "assistant"
  content: string
  source_documents?: any[]
  created_at: string
}

export class SupabaseService {
  private client: SupabaseClient

  constructor(useAdminClient = false) {
    if (useAdminClient) {
      const adminSupabaseUrl = process.env.SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (!adminSupabaseUrl || !supabaseServiceKey) {
        throw new Error(
          "Supabase admin client cannot be initialized: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.",
        )
      }
      this.client = createClient(adminSupabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    } else {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
          "Supabase client cannot be initialized: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.",
        )
      }
      this.client = supabase // 公開クライアントを使用
    }
  }

  // PDF Documents
  async getPdfDocuments(
    filters: {
      page?: number
      limit?: number
      status?: string
      party?: string
      region?: string
      search?: string
    } = {},
  ) {
    const { page = 1, limit = 20, status, party, region, search } = filters
    const offset = (page - 1) * limit

    let query = this.client
      .from("pdf_documents")
      .select("*", { count: "exact" })
      .order("upload_datetime", { ascending: false })

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

    return await query.range(offset, offset + limit - 1)
  }

  async updatePdfDocumentStatus(id: string, status: string, updates: Partial<PdfDocument> = {}) {
    return await this.client
      .from("pdf_documents")
      .update({ status, ...updates })
      .eq("id", id)
  }

  // Chat Sessions
  async createChatSession(name?: string): Promise<ChatSession> {
    const sessionName = name || `セッション ${new Date().toLocaleString("ja-JP")}`
    const { data, error } = await this.client
      .from("chat_sessions")
      .insert({ session_name: sessionName })
      .select()
      .single()

    if (error) throw error
    return data as ChatSession
  }

  async getChatSessions(limit = 10) {
    return await this.client.from("chat_sessions").select("*").order("updated_at", { ascending: false }).limit(limit)
  }

  // Chat Messages
  async addChatMessage(sessionId: string, messageType: "user" | "assistant", content: string, sourceDocuments?: any[]) {
    return await this.client.from("chat_messages").insert({
      session_id: sessionId,
      message_type: messageType,
      content,
      source_documents: sourceDocuments,
    })
  }

  async getChatMessages(sessionId: string) {
    return await this.client
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
  }

  // Get completed documents for AI search
  async getCompletedDocuments(limit = 10) {
    return await this.client
      .from("pdf_documents")
      .select("file_name, party_name, region, groq_index_id, ocr_text")
      .eq("status", "completed")
      .limit(limit)
  }

  // Fund Management Organizations
  async getFundManagementOrganizations(
    filters: {
      page?: number
      limit?: number
      politicianId?: number
      search?: string
      officeType?: string
      reportYear?: number
      jurisdiction?: string
      isActive?: boolean
    } = {},
  ): Promise<{ data: FundManagementOrganization[] | null; count: number | null; error: any }> {
    const { page = 1, limit = 20, politicianId, search, officeType, reportYear, jurisdiction, isActive } = filters
    const offset = (page - 1) * limit

    let query = this.client
      .from("fund_management_organizations")
      .select("*, politicians (id, name)", { count: "exact" }) // Example join with politicians
      .order("updated_at", { ascending: false })

    if (politicianId) {
      query = query.eq("politician_id", politicianId)
    }
    if (search) {
      query = query.ilike("organization_name", `%${search}%`)
    }
    if (officeType) {
      query = query.eq("office_type", officeType)
    }
    if (reportYear) {
      query = query.eq("report_year", reportYear)
    }
    if (jurisdiction) {
      query = query.eq("jurisdiction", jurisdiction)
    }
    if (isActive !== undefined) {
      query = query.eq("is_active", isActive)
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1)
    return { data: data as FundManagementOrganization[] | null, count, error }
  }

  async getFundManagementOrganizationById(
    id: number,
  ): Promise<{ data: FundManagementOrganization | null; error: any }> {
    const { data, error } = await this.client
      .from("fund_management_organizations")
      .select("*, politicians (id, name)")
      .eq("id", id)
      .single()
    return { data: data as FundManagementOrganization | null, error }
  }
}

// SupabaseService のインスタンス化。デフォルトは公開クライアントを使用。
// サーバーサイドで admin 操作が必要な場合は `new SupabaseService(true)` としてインスタンス化する。
export const supabaseService = new SupabaseService()
