"use client"

import useSWR from "swr"
import { supabase } from "@/lib/supabase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { User, Users, AlertTriangle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Politician } from "@/types/index"

interface PoliticiansPanelProps {
  partyId?: string | null
  searchTerm?: string
}

const fetchPoliticians = async (key: string, partyId?: string | null, searchTerm?: string): Promise<Politician[]> => {
  let query = supabase
    .from("politicians")
    .select("id, name, district, last_elected_date, party_id, political_parties(name)")
    .order("name")

  if (partyId) {
    query = query.eq("party_id", partyId)
  }
  if (searchTerm) {
    query = query.ilike("name", `%${searchTerm}%`)
  }

  const { data, error } = await query
  if (error) {
    console.error("Supabase error fetching politicians:", error)
    throw new Error(error.message)
  }
  // Map to ensure party name is correctly structured if political_parties is an object
  return (
    (data?.map((p) => ({
      ...p,
      // @ts-ignore
      party: p.political_parties ? { name: p.political_parties.name } : { name: "無所属" },
    })) as Politician[]) || []
  )
}

export default function PoliticiansPanel({ partyId, searchTerm }: PoliticiansPanelProps) {
  const {
    data: politicians,
    error,
    isLoading,
    mutate,
  } = useSWR<Politician[]>(["politicians", partyId, searchTerm], ([key, pId, sTerm]) =>
    fetchPoliticians(key, pId, sTerm),
  )

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-2 rounded-md bg-muted/50">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>政治家データの読み込みに失敗しました。</span>
            <Button onClick={() => mutate()} variant="destructive" size="sm">
              再試行
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    if (!politicians || politicians.length === 0) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          <User className="mx-auto h-10 w-10 mb-3" />
          <p>該当する政治家が見つかりません。</p>
        </div>
      )
    }

    return (
      <ul className="space-y-1">
        {politicians.map((p) => (
          <li
            key={p.id}
            className="p-2.5 rounded-md hover:bg-muted/80 transition-colors cursor-pointer border border-transparent hover:border-border"
          >
            <div className="font-medium text-sm">{p.name || "名前不明"}</div>
            <div className="text-xs text-muted-foreground">
              {p.party?.name || "無所属"} - {p.district || "選挙区情報なし"}
            </div>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <Card className="h-full flex flex-col bg-muted/30">
      <CardHeader className="py-3 px-4 border-b border-border">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Users className="mr-2 h-5 w-5" />
          政治家リスト
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow">
        <ScrollArea className="h-[calc(100vh-250px)] p-3">{renderContent()}</ScrollArea>
      </CardContent>
    </Card>
  )
}
