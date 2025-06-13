"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Users, Building, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Representative {
  name: string
  position?: string
  legislature: string
  electoral_district: string
  photo_url?: string
}

interface LegislatureBreakdown {
  legislature: string
  count: number
}

interface Party {
  name: string
  member_count: number
  representatives: Representative[]
  legislature_breakdown: LegislatureBreakdown[]
}

interface PartiesListProps {
  onPartySelect?: (party: Party) => void
}

export default function PartiesList({ onPartySelect }: PartiesListProps) {
  const [parties, setParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [sortColumn, setSortColumn] = useState("member_count")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [stats, setStats] = useState<{
    total_politicians: number
    legislature_breakdown: LegislatureBreakdown[]
  }>({ total_politicians: 0, legislature_breakdown: [] })

  const { toast } = useToast()

  // データ取得
  const fetchParties = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        search: searchTerm,
        sortColumn,
        sortOrder,
      })

      const response = await fetch(`/api/parties?${params}`)
      const data = await response.json()

      if (data.success) {
        setParties(data.data)
        setTotalPages(data.pagination.totalPages)
        setTotalCount(data.pagination.total)
        setStats(data.stats)
      } else {
        toast({
          title: "エラー",
          description: data.error || "政党データの取得に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("政党データ取得エラー:", error)
      toast({
        title: "エラー",
        description: "政党データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchParties()
  }, [currentPage, sortColumn, sortOrder])

  // 検索実行
  const handleSearch = () => {
    setCurrentPage(1)
    fetchParties()
  }

  // ソート変更
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortOrder("desc")
    }
  }

  // 政党選択
  const handlePartyClick = (party: Party) => {
    if (onPartySelect) {
      onPartySelect(party)
    }
  }

  // 会派の色分け
  const getPartyColor = (partyName: string) => {
    const colors: Record<string, string> = {
      自民: "bg-red-100 text-red-800 border-red-200",
      立憲民主: "bg-blue-100 text-blue-800 border-blue-200",
      公明: "bg-yellow-100 text-yellow-800 border-yellow-200",
      維新: "bg-orange-100 text-orange-800 border-orange-200",
      国民民主: "bg-green-100 text-green-800 border-green-200",
      共産: "bg-purple-100 text-purple-800 border-purple-200",
      れいわ: "bg-pink-100 text-pink-800 border-pink-200",
      社民: "bg-teal-100 text-teal-800 border-teal-200",
    }
    return colors[partyName] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  // 議会種別の表示名
  const getLegislatureName = (legislature: string) => {
    const names: Record<string, string> = {
      house_of_representatives: "衆議院",
      house_of_councillors: "参議院",
      local: "地方議会",
    }
    return names[legislature] || legislature
  }

  return (
    <div className="space-y-6">
      {/* 統計情報 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">政党数</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">総議員数</p>
                <p className="text-2xl font-bold">{stats.total_politicians}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {stats.legislature_breakdown.slice(0, 2).map((stat) => (
          <Card key={stat.legislature}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">{getLegislatureName(stat.legislature)}</p>
                  <p className="text-2xl font-bold">{stat.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 検索・ソート */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              政党一覧
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="政党名で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                検索
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* ソートボタン */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={sortColumn === "name" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSort("name")}
            >
              政党名順 {sortColumn === "name" && (sortOrder === "asc" ? "↑" : "↓")}
            </Button>
            <Button
              variant={sortColumn === "member_count" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSort("member_count")}
            >
              議員数順 {sortColumn === "member_count" && (sortOrder === "asc" ? "↑" : "↓")}
            </Button>
          </div>

          {/* 政党カード一覧 */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : parties.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>該当する政党が見つかりません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parties.map((party) => (
                <Card
                  key={party.name}
                  className={`cursor-pointer hover:shadow-lg transition-shadow border-2 ${getPartyColor(party.name)}`}
                  onClick={() => handlePartyClick(party)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">{party.name}</h3>
                      <Badge variant="secondary" className="text-lg font-semibold">
                        {party.member_count}名
                      </Badge>
                    </div>

                    {/* 議会別内訳 */}
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">議会別内訳</p>
                      <div className="flex flex-wrap gap-1">
                        {party.legislature_breakdown.map((breakdown) => (
                          <Badge key={breakdown.legislature} variant="outline" className="text-xs">
                            {getLegislatureName(breakdown.legislature)}: {breakdown.count}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* 代表的な議員 */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">主要議員</p>
                      <div className="space-y-2">
                        {party.representatives.slice(0, 2).map((rep, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={rep.photo_url || "/placeholder.svg"} alt={rep.name} />
                              <AvatarFallback className="text-xs">{rep.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{rep.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {getLegislatureName(rep.legislature)} {rep.electoral_district}
                              </p>
                            </div>
                          </div>
                        ))}
                        {party.representatives.length > 2 && (
                          <p className="text-xs text-muted-foreground">他{party.representatives.length - 2}名</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-muted-foreground">
                {totalCount}政党中 {(currentPage - 1) * 12 + 1}-{Math.min(currentPage * 12, totalCount)}政党を表示
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  前へ
                </Button>
                <span className="text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  次へ
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
