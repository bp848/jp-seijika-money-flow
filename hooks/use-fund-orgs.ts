"use client"

import useSWR from "swr"
import { supabase } from "@/lib/supabase-client"

// 関連テーブルの型を明示的に定義
interface PoliticianName {
  name: string | null
}

export interface FundOrg {
  id: string
  politician_id: string | null
  organization_name: string
  office_type: string | null
  report_year: number
  notified_date: string | null
  jurisdiction: string | null
  is_active: boolean
  // ネストされたオブジェクトとして型を定義
  politicians: PoliticianName | null
}

interface FundOrgFilters {
  searchTerm?: string
  isActive?: boolean
  limit?: number
}

const fetcher = async (filters: FundOrgFilters = {}): Promise<FundOrg[]> => {
  const { searchTerm, isActive, limit = 50 } = filters

  let query = supabase
    .from("fund_management_organizations")
    .select(
      `
      id,
      politician_id,
      organization_name,
      office_type,
      report_year,
      notified_date,
      jurisdiction,
      is_active,
      politicians ( name )
    `,
    )
    .order("report_year", { ascending: false })
    .limit(limit)

  if (searchTerm) {
    query = query.ilike("organization_name", `%${searchTerm}%`)
  }

  if (typeof isActive === "boolean") {
    query = query.eq("is_active", isActive)
  }

  const { data, error } = await query

  if (error) {
    console.error("Fund organizations fetch error:", error)
    throw error
  }

  // .map()による不要な変換を削除
  return data || []
}

export const useFundOrgs = (filters: FundOrgFilters = {}) => {
  const cacheKey = ["fund-orgs", filters.searchTerm, filters.isActive, filters.limit]
  const { data, error, isLoading, mutate } = useSWR<FundOrg[], Error>(cacheKey, () => fetcher(filters))

  return {
    fundOrgs: data,
    isLoading,
    isError: !!error,
    refetch: mutate,
  }
}
