"use client"

import useSWR from "swr"
import { supabase } from "@/lib/supabase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, FileText, CheckCircle2 } from "lucide-react"
import type { Party } from "@/types/index"

interface PartyGridDisplayProps {
  searchTerm?: string
  onPartyCardClick: (partyId: string) => void
  selectedPartyId: string | null
}

const fetchParties = async (key: string, searchTerm?: string): Promise<Party[]> => {
  let query = supabase.from("political_parties").select("id, name, representative, establishment_date, member_count")

  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,representative.ilike.%${searchTerm}%`)
  }
  query = query.order("name")

  const { data, error } = await query
  if (error) {
    console.error("Supabase error fetching parties:", error)
    throw new Error(error.message)
  }
  return (data as Party[]) || []
}

export default function PartyGridDisplay({ searchTerm, onPartyCardClick, selectedPartyId }: PartyGridDisplayProps) {
  const {
    data: parties,
    error,
    isLoading,
    mutate,
  } = useSWR<Party[]>(["parties", searchTerm], ([key, sTerm]) => fetchParties(key, sTerm))

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-muted/30">
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>エラー</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>政党データの取得に失敗。</span>
          <Button onClick={() => mutate()} variant="destructive" size="sm">
            再試行
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!parties || parties.length === 0) {
    return <p className="text-center text-muted-foreground py-4">該当する政党が見つかりません。</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {parties.map((party) => (
        <Card
          key={party.id}
          className={`cursor-pointer transition-all bg-muted/40 hover:bg-muted/70 ${
            selectedPartyId === party.id ? "ring-2 ring-primary shadow-lg" : "border-border"
          }`}
          onClick={() => onPartyCardClick(party.id)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <FileText className="h-6 w-6 text-muted-foreground mb-2" />
              {selectedPartyId === party.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
            </div>
            <CardTitle className="text-base font-semibold leading-tight truncate" title={party.name || "名前不明"}>
              {party.name || "名前不明"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-1">
              政党ダッシュボード
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
