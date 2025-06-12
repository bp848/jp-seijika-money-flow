// Supabase クライアントのユーティリティ関数
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { FundManagementOrganization } from "@/types"

// Re-export createClient for external use
export { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

// Server-side client (with service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || "", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Client-side client (with anon key)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey || "")

export const supabase = supabaseClient

export default supabase

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
  constructor(private client: SupabaseClient = supabaseAdmin) {}

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

export const supabaseService = new SupabaseService()
