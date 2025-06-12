"use client"

import useSWR from "swr"
import { supabase } from "@/lib/supabase-client"

export interface Party {
  id: string
  name: string
  leader?: string
  leader_id?: string
  member_count?: number
  founded_date?: string
  created_at: string
}

const fetcher = async (): Promise<Party[]> => {
  const { data, error } = await supabase.from("political_parties").select("*").order("name")

  if (error) throw error
  return data || []
}

export const useParties = () => {
  const { data, error, isLoading } = useSWR<Party[]>("parties", fetcher)

  return {
    parties: data,
    isLoading,
    isError: !!error,
  }
}
