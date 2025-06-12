"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, UsersIcon } from "lucide-react"
import { usePoliticians, type Politician } from "@/hooks/use-politicians" // Ensure Politician type is exported
import { useRouter } from "next/navigation"

interface PoliticiansListProps {
  partyId?: string | null
  searchTerm?: string
}

export default function PoliticiansList({ partyId, searchTerm }: PoliticiansListProps) {
  const { politicians, isLoading, isError, refetch } = usePoliticians({ partyId, searchTerm, limit: 50 }) // Increased limit
  const router = useRouter()

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>
      )
    }

    if (isError) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>政治家データの取得に失敗。</span>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="ml-2">
              再試行
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    if (!politicians || politicians.length === 0) {
      return <p className="text-sm text-muted-foreground">該当する政治家データはありません。</p>
    }

    return (
      <ul className="space-y-1">
        {politicians.map((politician: Politician) => (
          <li key={politician.id}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left h-auto py-1.5 px-2"
              onClick={() => router.push(`/politician/${politician.id}`)} // Assuming detail page exists
            >
              {politician.name || "氏名不明"}
              {politician.party_name && politician.party_name !== "無所属" && (
                <span className="ml-2 text-xs text-muted-foreground">({politician.party_name})</span>
              )}
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
          <UsersIcon className="mr-2 h-5 w-5" />
          政治家リスト
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-3">{renderContent()}</ScrollArea>
      </CardContent>
    </Card>
  )
}
