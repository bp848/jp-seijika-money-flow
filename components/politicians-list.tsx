"use client"

import { useState, useEffect } from "react"
import Link from "next/link" // Import Link for navigation
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, User, MapPin, ExternalLink, Download, Building, LinkIcon } from "lucide-react" // Added Briefcase, LinkIcon
import { useToast } from "@/hooks/use-toast"

// Updated Politician interface to support linking
interface Politician {
  id: string // Politician's ID
  name: string
  name_kana: string

  party_name?: string // Display name for the party
  party_id?: string // ID for linking to party's explorer page

  party_branch_name?: string // Display name for the branch
  party_branch_id?: string // ID for linking to branch's explorer page

  electoral_district?: string // Original electoral district text if needed separately

  election_count: number
  prefecture: string // This might be part of electoral_district or branch info
  position?: string // For non-linkable display
  legislature: string
  term_end_date?: string
  photo_url?: string
  profile_url?: string // For external link
  current_positions?: string // For non-linkable display
}

interface PoliticiansListProps {
  // onPoliticianSelect?: (politician: Politician) => void; // Replaced by direct linking
  defaultLegislature?: string
}

// Mock data function to simulate API response with new fields
const fetchPoliticiansMock = async (
  params: URLSearchParams,
): Promise<{
  success: boolean
  data: Politician[]
  pagination: { totalPages: number; total: number }
  stats: {
    parties: Array<{ party: string; count: number }>
    legislatures: Array<{ legislature: string; count: number }>
  }
  error?: string
}> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const page = Number.parseInt(params.get("page") || "1")
  const sampleData: Politician[] = [
    {
      id: "1043",
      name: "岸田 文雄",
      name_kana: "キシダ フミオ",
      party_name: "自由民主党",
      party_id: "jimin-1",
      party_branch_name: "自由民主党広島県第1選挙区支部",
      party_branch_id: "jimin-hiroshima-1",
      electoral_district: "広島1区",
      election_count: 10,
      prefecture: "広島県",
      legislature: "house_of_representatives",
      current_positions: "内閣総理大臣、自由民主党総裁",
      photo_url: "/placeholder.svg?width=40&height=40",
      profile_url: "#",
    },
    {
      id: "2011",
      name: "野田 佳彦",
      name_kana: "ノダ ヨシヒコ",
      party_name: "立憲民主党",
      party_id: "rikken-2",
      party_branch_name: "立憲民主党千葉県第4選挙区支部",
      party_branch_id: "rikken-chiba-4",
      electoral_district: "千葉4区",
      election_count: 9,
      prefecture: "千葉県",
      legislature: "house_of_representatives",
      current_positions: "立憲民主党最高顧問",
      photo_url: "/placeholder.svg?width=40&height=40",
    },
    {
      id: "3055",
      name: "山口 那津男",
      name_kana: "ヤマグチ ナツオ",
      party_name: "公明党",
      party_id: "komei-3",
      // Assuming proportional representation might not have a specific "branch" in the same way, or it's the party itself
      party_branch_name: "公明党比例区",
      party_branch_id: "komei-hirei",
      electoral_district: "比例代表",
      election_count: 5,
      prefecture: "東京都",
      legislature: "house_of_councillors",
      current_positions: "公明党代表",
      photo_url: "/placeholder.svg?width=40&height=40",
    },
    // Add more mock politicians
    {
      id: "4001",
      name: "玉木 雄一郎",
      name_kana: "タマキ ユウイチロウ",
      party_name: "国民民主党",
      party_id: "kokumin-4",
      party_branch_name: "国民民主党香川県第2選挙区支部",
      party_branch_id: "kokumin-kagawa-2",
      electoral_district: "香川2区",
      election_count: 5,
      prefecture: "香川県",
      legislature: "house_of_representatives",
      current_positions: "国民民主党代表",
      photo_url: "/placeholder.svg?width=40&height=40",
    },
  ]

  const total = sampleData.length * 5 // Simulate more data for pagination
  const paginatedData = sampleData.slice(0, 20) // Simulate one page

  return {
    success: true,
    data: paginatedData,
    pagination: { totalPages: Math.ceil(total / 20), total },
    stats: {
      parties: [
        { party: "自由民主党", count: 150 },
        { party: "立憲民主党", count: 100 },
        { party: "公明党", count: 50 },
        { party: "国民民主党", count: 30 },
      ],
      legislatures: [
        { legislature: "house_of_representatives", count: 200 },
        { legislature: "house_of_councillors", count: 130 },
      ],
    },
  }
}

export default function PoliticiansList({ defaultLegislature }: PoliticiansListProps) {
  const [politicians, setPoliticians] = useState<Politician[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPartyFilter, setSelectedPartyFilter] = useState<string>("all") // Renamed to avoid conflict
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>("all")
  const [selectedLegislature, setSelectedLegislature] = useState<string>(defaultLegislature || "all")
  const [sortColumn, setSortColumn] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState<{
    parties: Array<{ party: string; count: number }>
    legislatures: Array<{ legislature: string; count: number }>
  }>({ parties: [], legislatures: [] })

  const { toast } = useToast()

  const fetchPoliticians = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        search: searchTerm,
        party: selectedPartyFilter, // Use renamed state
        prefecture: selectedPrefecture,
        legislature: selectedLegislature,
        sortColumn,
        sortOrder,
      })

      // const response = await fetch(`/api/politicians?${params}`) // Real API call
      // const data = await response.json()
      const data = await fetchPoliticiansMock(params) // Using mock function

      if (data.success) {
        setPoliticians(data.data)
        setTotalPages(data.pagination.totalPages)
        setTotalCount(data.pagination.total)
        if (data.stats) setStats(data.stats) // Ensure stats is updated
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

  const importSangiinData = async () => {
    setImporting(true)
    // ... (import logic remains the same, ensure it fetches new Politician structure)
    // For now, just simulate and re-fetch
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast({ title: "インポート完了 (シミュレーション)", description: "データをインポートしました。" })
    fetchPoliticians()
    setImporting(false)
  }

  useEffect(() => {
    fetchPoliticians()
  }, [currentPage, selectedPartyFilter, selectedPrefecture, selectedLegislature, sortColumn, sortOrder])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchPoliticians()
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortOrder("asc")
    }
  }

  const getPartyColor = (partyName?: string) => {
    if (!partyName) return "bg-gray-100 text-gray-800"
    const colors: Record<string, string> = {
      自由民主党: "bg-red-100 text-red-800",
      立憲民主党: "bg-blue-100 text-blue-800",
      公明党: "bg-yellow-100 text-yellow-800",
      国民民主党: "bg-green-100 text-green-800",
      // Add other parties as needed
    }
    return colors[partyName] || "bg-gray-100 text-gray-800"
  }

  const getLegislatureName = (legislature: string) => {
    const names: Record<string, string> = {
      house_of_representatives: "衆議院",
      house_of_councillors: "参議院",
      local: "地方議会",
    }
    return names[legislature] || legislature
  }

  const getLegislatureIcon = (legislature: string) => {
    switch (legislature) {
      case "house_of_representatives":
        return <Building className="h-4 w-4 text-blue-600" />
      case "house_of_councillors":
        return <Building className="h-4 w-4 text-red-600" />
      case "local":
        return <Building className="h-4 w-4 text-green-600" />
      default:
        return <Building className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards ... (remains largely the same, ensure keys are correct if data structure changes) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">総政治家数</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {stats.legislatures.slice(0, 3).map((stat) => (
          <Card key={stat.legislature}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                {getLegislatureIcon(stat.legislature)}
                <div>
                  <p className="text-sm text-muted-foreground">{getLegislatureName(stat.legislature)}</p>
                  <p className="text-2xl font-bold">{stat.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              政治家一覧
            </CardTitle>
            <Button onClick={importSangiinData} disabled={importing} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              {importing ? "インポート中..." : "参議院データ取得"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="政治家名、読み方、政党、支部で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>

            <Select value={selectedLegislature} onValueChange={setSelectedLegislature}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="議会種別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての議会</SelectItem>
                <SelectItem value="house_of_representatives">衆議院</SelectItem>
                <SelectItem value="house_of_councillors">参議院</SelectItem>
                <SelectItem value="local">地方議会</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPartyFilter} onValueChange={setSelectedPartyFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="所属政党" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての政党</SelectItem>
                {stats.parties.map(
                  (
                    p, // Changed variable name to avoid conflict
                  ) => (
                    <SelectItem key={p.party} value={p.party}>
                      {p.party} ({p.count})
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            {/* Prefecture filter can remain if needed */}
            <Button onClick={handleSearch} disabled={loading}>
              検索
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">写真</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 min-w-[120px]"
                    onClick={() => handleSort("name")}
                  >
                    氏名 {sortColumn === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 min-w-[120px]"
                    onClick={() => handleSort("party_name")}
                  >
                    所属政党 {sortColumn === "party_name" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 min-w-[200px]"
                    onClick={() => handleSort("party_branch_name")}
                  >
                    所属支部 {sortColumn === "party_branch_name" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="min-w-[100px]">議会</TableHead>
                  <TableHead className="min-w-[120px]">選挙区</TableHead>
                  <TableHead className="min-w-[100px]">役職</TableHead>
                  <TableHead className="w-[50px]">詳細</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      読み込み中...
                    </TableCell>
                  </TableRow>
                ) : politicians.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      該当する政治家が見つかりません
                    </TableCell>
                  </TableRow>
                ) : (
                  politicians.map((politician) => (
                    <TableRow key={politician.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={politician.photo_url || `/placeholder.svg?width=40&height=40&query=${politician.name}`}
                            alt={politician.name}
                          />
                          <AvatarFallback>{politician.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link
                          href={`/explorer/politician/${politician.id}`}
                          className="text-cyan-500 hover:text-cyan-400 hover:underline"
                        >
                          {politician.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">{politician.name_kana}</div>
                      </TableCell>
                      <TableCell>
                        {politician.party_id && politician.party_name ? (
                          <Link href={`/explorer/party/${politician.party_id}`} className="hover:underline">
                            <Badge
                              className={`${getPartyColor(politician.party_name)} hover:opacity-80 transition-opacity`}
                            >
                              {politician.party_name}
                            </Badge>
                          </Link>
                        ) : politician.party_name ? (
                          <Badge className={getPartyColor(politician.party_name)}>{politician.party_name}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {politician.party_branch_id && politician.party_branch_name ? (
                          <Link
                            href={`/explorer/branch/${politician.party_branch_id}`}
                            className="text-sm text-cyan-500 hover:text-cyan-400 hover:underline"
                          >
                            {politician.party_branch_name}
                          </Link>
                        ) : politician.party_branch_name ? (
                          <span className="text-sm">{politician.party_branch_name}</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          {getLegislatureIcon(politician.legislature)}
                          {getLegislatureName(politician.legislature)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {politician.electoral_district || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {politician.current_positions || politician.position || "-"}
                      </TableCell>
                      <TableCell>
                        {politician.profile_url ? (
                          <Button variant="ghost" size="icon" asChild className="h-7 w-7">
                            <a
                              href={politician.profile_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="プロフィールを開く"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" disabled className="h-7 w-7">
                            <LinkIcon className="h-4 w-4 text-muted-foreground/50" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination ... (remains the same) */}
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
