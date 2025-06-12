"use client"

import useSWR from "swr"
import { supabase } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, LandmarkIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FundOrg {
  id: string
  organization_name: string | null
}

export default function FundOrgsList() {
  const fetcher = async (): Promise<FundOrg[]> => {
    const { data, error } = await supabase
      .from("fund_management_organizations")
      .select("id, organization_name")
      .order("organization_name")
    if (error) throw error
    return data || []
  }

  const { data: list, error, isLoading, mutate } = useSWR<FundOrg[]>("fund_orgs", fetcher)
  const router = useRouter()

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
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
            <span>資金管理団体データの取得に失敗しました。</span>
            <Button onClick={() => mutate()} variant="outline" size="sm" className="ml-2">
              再試行
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    if (!list || list.length === 0) {
      return <p className="text-sm text-muted-foreground">該当する資金管理団体データはありません。</p>
    }

    return (
      <ul className="space-y-1">
        {list.map((org) => (
          <li key={org.id}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left h-auto py-1.5 px-2"
              onClick={() => router.push(`/fund-org/${org.id}`)}
            >
              {org.organization_name || "団体名不明"}
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
          <LandmarkIcon className="mr-2 h-5 w-5" />
          資金管理団体リスト
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-3">{renderContent()}</ScrollArea>
      </CardContent>
    </Card>
  )
}
