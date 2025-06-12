"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, User, MapPin, Calendar, Award, ExternalLink, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SangiinMember {
  id: string
  name: string
  name_reading: string
  party: string
  electoral_district: string
  term_end_date: string
  photo_url: string
  election_count: number
  current_positions: string
  profile_url: string
  election_years: string
}

export default function SangiinMembersList() {
  const [members, setMembers] = useState<SangiinMember[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedParty, setSelectedParty] = useState<string>("all")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all")
  const [sortColumn, setSortColumn] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState<{
    parties: Array<{ party: string; count: number }>
    districts: Array<{ electoral_district: string; count: number }>
  }>({ parties: [], districts: [] })

  const { toast } = useToast()

  // データ取得
  const fetchMembers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        search: searchTerm,
        party: selectedParty,
        district: selectedDistrict,
        sortColumn,
        sortOrder,
      })

      const response = await fetch(`/api/sangiin-members?${params}`)
      const data = await response.json()

      if (data.success) {
        setMembers(data.data)
        setTotalPages(data.pagination.totalPages)
        setTotalCount(data.pagination.total)
        setStats(data.stats)
      } else {
        toast({
          title: "エラー",
          description: data.error || "データの取得に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("データ取得エラー:", error)
      toast({
        title: "エラー",
        description: "データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // データインポート
  const importData = async () => {
    setImporting(true)
    try {
      const response = await fetch("/api/sangiin-members/import", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        toast({
          title: "インポート完了",
          description: `${data.insertedCount}件のデータをインポートしました`,
        })
        fetchMembers() // データを再取得
      } else {
        toast({
          title: "インポートエラー",
          description: data.error || "インポートに失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("インポートエラー:", error)
      toast({
        title: "インポートエラー",
        description: "インポートに失敗しました",
        variant: "destructive",
      })
    } finally {
      setImporting(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [currentPage, selectedParty, selectedDistrict, sortColumn, sortOrder])

  // 検索実行
  const handleSearch = () => {
    setCurrentPage(1)
    fetchMembers()
  }

  // ソート変更
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortOrder("asc")
    }
  }

  // 会派の色分け
  const getPartyColor = (party: string) => {
    const colors: Record<string, string> = {
      自民: "bg-red-100 text-red-800",
      立憲民主: "bg-blue-100 text-blue-800",
      公明: "bg-yellow-100 text-yellow-800",
      維新: "bg-orange-100 text-orange-800",
      国民民主: "bg-green-100 text-green-800",
      共産: "bg-purple-100 text-purple-800",
      れいわ: "bg-pink-100 text-pink-800",
      社民: "bg-teal-100 text-teal-800",
    }
    return colors[party] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {/* 統計情報 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">総議員数</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {stats.parties.slice(0, 3).map((stat) => (
          <Card key={stat.party}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">{stat.party}</p>
                  <p className="text-2xl font-bold">{stat.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* メイン操作パネル */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              参議院議員一覧
            </CardTitle>
            <Button onClick={importData} disabled={importing} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              {importing ? "インポート中..." : "最新データ取得"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 検索・フィルター */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="議員名、読み方、会派、選挙区で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>

            <Select value={selectedParty} onValueChange={setSelectedParty}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="会派で絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての会派</SelectItem>
                {stats.parties.map((party) => (
                  <SelectItem key={party.party} value={party.party}>
                    {party.party} ({party.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="選挙区で絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての選挙区</SelectItem>
                {stats.districts.slice(0, 20).map((district) => (
                  <SelectItem key={district.electoral_district} value={district.electoral_district}>
                    {district.electoral_district} ({district.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleSearch} disabled={loading}>
              検索
            </Button>
          </div>

          {/* 議員一覧テーブル */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>写真</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("name")}>
                    議員名 {sortColumn === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead>読み方</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("party")}>
                    会派 {sortColumn === "party" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("electoral_district")}
                  >
                    選挙区 {sortColumn === "electoral_district" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("election_count")}>
                    当選回数 {sortColumn === "election_count" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("term_end_date")}>
                    任期満了 {sortColumn === "term_end_date" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead>役職</TableHead>
                  <TableHead>詳細</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      読み込み中...
                    </TableCell>
                  </TableRow>
                ) : members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      該当する議員が見つかりません
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.photo_url || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{member.name_reading}</TableCell>
                      <TableCell>
                        <Badge className={getPartyColor(member.party)}>{member.party}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {member.electoral_district}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.election_count}回</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {member.term_end_date ? new Date(member.term_end_date).toLocaleDateString("ja-JP") : "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-32 truncate">
                        {member.current_positions || "-"}
                      </TableCell>
                      <TableCell>
                        {member.profile_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={member.profile_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                {totalCount}件中 {(currentPage - 1) * 20 + 1}-{Math.min(currentPage * 20, totalCount)}件を表示
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
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
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
