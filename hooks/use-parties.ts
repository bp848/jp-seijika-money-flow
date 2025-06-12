"use client"

import useSWR from "swr"
import { supabase } from "@/lib/supabase-client"

export interface Party {
  id: string
  name: string
  // 以下はDBに実在し、かつ表示に必要な場合のみコメント解除・利用
  // leader?: string
  // leader_id?: string
  // member_count?: number
  // founded_date?: string
  // created_at: string // created_at は通常 Supabase が自動付与
}

// searchTerm は現状未使用だが、将来的な拡張のために残す
const fetcher = async (key: string, searchTerm?: string): Promise<Party[]> => {
  // 実在するカラムのみを選択: id, name は必須と仮定
  // 他のカラム (leader, member_count, founded_date 等) はDBスキーマに確実に存在する場合のみ追加
  let query = supabase.from("political_parties").select("id, name")

  if (searchTerm) {
    // name カラムでの検索を想定
    query = query.ilike("name", `%${searchTerm}%`)
  }
  query = query.order("name")

  const { data, error } = await query

  if (error) {
    console.error("Supabase error fetching parties:", error)
    throw error
  }
  return (data as Party[]) || []
}

export const useParties = (searchTerm?: string) => {
  // キャッシュキーに searchTerm を含めることで、検索語ごとのキャッシュを有効化
  const cacheKey = searchTerm ? ["parties", searchTerm] : "parties"
  const { data, error, isLoading, mutate } = useSWR<Party[]>(cacheKey, (key) =>
    fetcher(Array.isArray(key) ? key[0] : key, searchTerm),
  )

  return {
    parties: data,
    isLoading,
    isError: !!error,
    refetch: mutate, // refetch関数を返す
  }
}
