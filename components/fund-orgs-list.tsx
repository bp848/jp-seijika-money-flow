"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Building, Calendar, MapPin } from "lucide-react"
import { useFundOrgs } from "@/hooks/use-fund-orgs"

export default function FundOrgsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const { fundOrgs, isLoading, isError } = useFundOrgs()
  const router = useRouter()

  if (isLoading) return <div className="text-center p-8">資金管理団体データを読み込み中...</div>
  if (isError) return <div className="text-center p-8 text-red-500">データの取得に失敗しました</div>

  const filteredFundOrgs =
    fundOrgs?.filter(
      (org) =>
        org.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.politician_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.office_type?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="団体名、政治家名、または公職で検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFundOrgs.map((org) => (
          <Card key={org.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5" />
                <span className="truncate">{org.organization_name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {org.politician_name && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">関連政治家:</span>
                    <span
                      className="text-sm text-blue-600 hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/politician-dashboard/${org.politician_id}`)
                      }}
                    >
                      {org.politician_name}
                    </span>
                  </div>
                )}
                {org.office_type && <Badge variant="secondary">{org.office_type}</Badge>}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>報告年: {org.report_year}</span>
                </div>
                {org.jurisdiction && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{org.jurisdiction}</span>
                  </div>
                )}
                {org.notified_date && (
                  <p className="text-xs text-gray-500">届出日: {new Date(org.notified_date).toLocaleDateString()}</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => router.push(`/politician-dashboard/fund-org-${org.id}`)}
                >
                  詳細を見る
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFundOrgs.length === 0 && (
        <div className="text-center p-8 text-gray-500">検索条件に一致する資金管理団体が見つかりませんでした</div>
      )}
    </div>
  )
}
