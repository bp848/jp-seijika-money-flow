export interface Transaction {
  id: string
  date: string
  from: string
  to: string
  amount: number
  type: "income" | "expense"
  description: string
  documentUrl: string
}

export interface AnalysisHistoryItem {
  id: string
  timestamp: string
  query: string
  resultType: "text" | "graph"
}

export type EntityType =
  | "politician_individual" // 個人政治家
  | "politician_group" // 政治家グループ
  | "party_headquarters" // 政党本部
  | "party_branch" // 政党支部
  | "support_group" // 後援会
  | "large_corporation" // 大企業
  | "medium_corporation" // 中企業
  | "small_corporation" // 小企業
  | "financial_institution" // 金融機関
  | "construction_company" // 建設会社
  | "tech_company" // IT企業
  | "media_company" // メディア企業
  | "labor_union" // 労働組合
  | "industry_association" // 業界団体
  | "npo_organization" // NPO団体
  | "service_provider" // サービス提供者
  | "government_agency" // 政府機関
  | "fund_management_organization" // 資金管理団体
  | "unknown"

export interface CytoscapeNodeData {
  id: string
  label: string
  type: EntityType
}

// ノードサイズの定義を追加
export interface NodeSizeConfig {
  radius: number
  importance: number
}

export interface FundManagementOrganization {
  id: string // Changed to string to match other IDs
  politician_id: string | null
  organization_name: string | null
  office_type: string | null
  report_year: number | null
  notified_date: string | null
  jurisdiction: string | null
  is_active: boolean | null
  created_at: string
  updated_at: string
  politicians?: { name: string; id: string }
}

// Ensure Party and Politician types are comprehensive for the UI

export interface Party {
  id: string
  name: string
  representative?: string | null
  establishment_date?: string | null
  member_count?: number | null
  // Add any other fields that might be used in PartyGridDisplay or elsewhere
}

export interface Politician {
  id: string
  name: string
  district?: string | null
  last_elected_date?: string | null
  party_id?: string | null
  party?: {
    // For joined data
    name?: string | null
  } | null
  // Add any other fields that might be used in PoliticiansPanel or elsewhere
  political_parties?: {
    // Direct from Supabase join if not aliased
    name?: string | null
  } | null
}

export interface FundFlow {
  id: string
  source_entity: string | null
  target_entity: string | null
  amount: number | null
  flow_date: string | null
}
