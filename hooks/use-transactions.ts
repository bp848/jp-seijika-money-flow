"use client"

import useSWR from "swr"
import { supabase } from "@/lib/supabase-client"
import type { Transaction } from "@/types/database"

interface TransactionFilters {
  searchTerm?: string
  typeFilter?: string
  limit?: number
}

const fetcher = async (filters: TransactionFilters): Promise<Transaction[]> => {
  const { searchTerm = "", typeFilter = "all", limit = 100 } = filters

  const { data, error } = await supabase.rpc("search_transactions", {
    search_term: searchTerm,
    type_filter: typeFilter,
    row_limit: limit,
  })

  if (error) {
    console.error("Supabase RPC error in search_transactions:", error)
    throw error
  }

  return data || []
}

export const useTransactions = (filters: TransactionFilters) => {
  // フィルター条件をキャッシュキーに含める
  const cacheKey = ["transactions", filters.searchTerm, filters.typeFilter, filters.limit]

  const { data, error, isLoading, mutate } = useSWR<Transaction[], Error>(cacheKey, () => fetcher(filters), {
    revalidateOnFocus: false, // フォーカス時の自動再検証を無効化
  })

  return {
    transactions: data,
    isLoading,
    isError: !!error,
    refetch: mutate,
  }
}
