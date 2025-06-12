// src/hooks/usePoliticians.ts
import useSWR from "swr"
import { supabase } from "@/lib/supabase-client"
import { z } from "zod"
import type { Database } from "@/types/database" // Supabase自動生成型をインポート

// Zodスキーマ定義 (変更なし)
const PoliticianSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  party_id: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
  party_name: z.string().nullable(),
})

const PoliticiansResponseSchema = z.array(PoliticianSchema)

export type Politician = z.infer<typeof PoliticianSchema>

// Supabaseからのデータ型 (Row型)
// political_partiesテーブルの'name'カラムを'party'エイリアスで取得することを想定
type PoliticianRow = Database["public"]["Tables"]["politicians"]["Row"] & {
  party: { name: string } | null // エイリアス 'party' とその構造
}

interface PoliticianFilters {
  searchTerm?: string
  partyId?: string
  limit?: number
}

const fetcher = async (filters: PoliticianFilters = {}): Promise<Politician[]> => {
  const { searchTerm, partyId, limit = 25 } = filters

  let query = supabase
    .from("politicians")
    .select(
      `
      id,
      name,
      party_id,
      created_at,
      party: political_parties(name) 
    `,
    ) // エイリアス 'party' を使用
    .order("name", { ascending: true })
    .limit(limit)

  if (searchTerm) {
    query = query.ilike("name", `%${searchTerm}%`)
  }

  if (partyId) {
    query = query.eq("party_id", partyId)
  }

  const { data, error } = await query

  if (error) {
    console.error("[HELLBUILD-FATALITY] Politicians fetch failed:", error)
    throw new Error("政治家データの取得に失敗した。DBが死んだか、貴様のクエリがクソかのどちらかだ。")
  }

  // 型をPoliticianRowにキャストし、安全にアクセス
  const transformedData = ((data as PoliticianRow[] | null) || []).map((p) => ({
    id: p.id,
    name: p.name,
    party_id: p.party_id,
    created_at: p.created_at,
    party_name: p.party?.name || "無所属", // エイリアス 'party' を使用
  }))

  return PoliticiansResponseSchema.parse(transformedData)
}

export const usePoliticians = (filters: PoliticianFilters = {}) => {
  const cacheKey = ["politicians", filters.searchTerm, filters.partyId, filters.limit]
  const { data, error, isLoading, mutate } = useSWR<Politician[]>(cacheKey, () => fetcher(filters))

  return {
    politicians: data,
    isLoading,
    isError: !!error,
    refetch: mutate,
  }
}
