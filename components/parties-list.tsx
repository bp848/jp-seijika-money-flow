"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Building2, Users } from "lucide-react"
import { useParties } from "@/hooks/use-parties"

export default function PartiesList() {
  const [searchTerm, setSearchTerm] = useState("")
  const { parties, isLoading, isError } = useParties()
  const router = useRouter()

  if (isLoading) return <div className="text-center p-8">政党データを読み込み中...</div>
  if (isError) return <div className="text-center p-8 text-red-500">データの取得に失敗しました</div>

  const filteredParties =
    parties?.filter(
      (party) =>
        party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.leader?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="政党名または代表者名で検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredParties.map((party) => (
          <Card key={party.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                {party.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {party.leader && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span
                      className="text-sm text-blue-600 hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/politician-dashboard/${party.leader_id || party.leader}`)
                      }}
                    >
                      {party.leader}
                    </span>
                  </div>
                )}
                {party.member_count && <Badge variant="outline">{party.member_count}名</Badge>}
                {party.founded_date && (
                  <p className="text-sm text-gray-600">設立: {new Date(party.founded_date).toLocaleDateString()}</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => router.push(`/politician-dashboard/party-${party.id}`)}
                >
                  政党ダッシュボード
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredParties.length === 0 && (
        <div className="text-center p-8 text-gray-500">検索条件に一致する政党が見つかりませんでした</div>
      )}
    </div>
  )
}
