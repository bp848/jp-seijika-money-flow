"use client"

import useSWR from "swr"
import { supabase } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, FlagIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Party {
  id: string
  name: string | null
}

export default function PartiesList() {
  const fetcher = async (): Promise<Party[]> => {
    const { data, error } = await supabase.from("political_parties").select("id, name").order("name")
    if (error) throw error
    return data || []
  }

  const { data: parties, error, isLoading, mutate } = useSWR<Party[]>("parties", fetcher)
  const router = useRouter()

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
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
            <span>政党データの取得に失敗しました。</span>
            <Button onClick={() => mutate()} variant="outline" size="sm" className="ml-2">
              再試行
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    if (!parties || parties.length === 0) {
      return <p className="text-sm text-muted-foreground">該当する政党データはありません。</p>
    }

    return (
      <ul className="space-y-1">
        {parties.map((pt) => (
          <li key={pt.id}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left h-auto py-1.5 px-2"
              onClick={() => router.push(`/party/${pt.id}`)}
            >
              {pt.name || "名前不明"}
            </Button>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="flex items-center text-xl">
          <FlagIcon className="mr-2 h-5 w-5" />
          政党リスト
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-3">{renderContent()}</ScrollArea>
      </CardContent>
    </Card>
  )
}
