"use client"

import { useState, useCallback } from "react"
import { Users, Search, Share2, Briefcase, Landmark } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FlowSankeyChart } from "@/app/flow/components/flow-sankey-chart" // Re-use for visualization
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface EntityNode {
  id: number // Unique ID for the graph node (can be different from original entity ID)
  label: string
  originalId: number // Actual ID from database
  type: "politician" | "organization" | "company" | "individual" // Example types
}

interface EntityLink {
  source: number // Graph node ID
  target: number // Graph node ID
  value: number // e.g., total transaction amount
  label: string // e.g., "¥100万 (寄付)"
  type: "funding" | "service_provision" // Example types
}

interface RelationshipData {
  nodes: EntityNode[]
  links: EntityLink[]
  centralEntity?: EntityNode
}

export default function RelationshipExplorerPage() {
  const [data, setData] = useState<RelationshipData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [entityId, setEntityId] = useState<string | null>(null) // ID of the entity to explore

  // Placeholder for search results if implementing a search dropdown
  // const [searchResults, setSearchResults] = useState<any[]>([]);
  // const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchData = useCallback(async (id: string) => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/relationship-explorer?entityId=${id}`)
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || "関連データの取得に失敗しました。")
      }
      const result: RelationshipData = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message)
      console.error("Fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSearch = () => {
    // In a real app, you might first search for the entityId based on searchTerm
    // For now, assume searchTerm IS the entityId for simplicity
    if (searchTerm.trim()) {
      setEntityId(searchTerm.trim())
      fetchData(searchTerm.trim())
    }
  }

  // useEffect(() => {
  //   if (debouncedSearchTerm) {
  //     // API call to fetch search suggestions for entities
  //   } else {
  //     setSearchResults([]);
  //   }
  // }, [debouncedSearchTerm]);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">政治家・団体 関係性エクスプローラー</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          特定の人物や団体を中心とした資金の流れや関連性を探索します。
        </p>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            探索対象の入力
          </CardTitle>
          <CardDescription>分析したい政治家名、団体名、またはIDを入力してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-md items-center space-x-2">
            <Input
              type="text"
              placeholder="例: 岸田文雄, 自由民主党, 12345"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isLoading || !searchTerm.trim()}>
              <Search className="mr-2 h-4 w-4" /> 探索
            </Button>
          </div>
          {/* Add search suggestions dropdown here later */}
        </CardContent>
      </Card>

      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-96 w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && data && data.centralEntity && (
        <div className="space-y-8">
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {data.centralEntity.type === "politician" && <Users className="h-6 w-6 text-primary" />}
                  {data.centralEntity.type === "organization" && <Landmark className="h-6 w-6 text-primary" />}
                  {data.centralEntity.type === "company" && <Briefcase className="h-6 w-6 text-primary" />}
                  {data.centralEntity.label}
                  <Badge variant="outline">{data.centralEntity.type}</Badge>
                </CardTitle>
                <CardDescription>ID: {data.centralEntity.originalId}</CardDescription>
              </CardHeader>
              {/* Add more details about the central entity here */}
            </Card>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              関連資金フローネットワーク
            </h2>
            {data.nodes.length > 1 && data.links.length > 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <FlowSankeyChart nodes={data.nodes} links={data.links} height={600} />
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertTitle>情報なし</AlertTitle>
                <AlertDescription>
                  選択されたエンティティに関する表示可能な資金フローデータが見つかりませんでした。
                  (現在のAPIはダミーデータを返します)
                </AlertDescription>
              </Alert>
            )}
          </section>

          {/* Placeholder for related entities list / tables */}
          {/* <section>
            <h2 className="text-xl font-semibold mb-4">関連エンティティリスト</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>主な資金提供元</CardTitle></CardHeader>
                <CardContent> <p>リスト表示...</p> </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>主な資金提供先</CardTitle></CardHeader>
                <CardContent> <p>リスト表示...</p> </CardContent>
              </Card>
            </div>
          </section> */}
        </div>
      )}
      {!isLoading && entityId && !data && !error && (
        <Alert>
          <AlertTitle>データなし</AlertTitle>
          <AlertDescription>
            指定されたエンティティ ({entityId})
            に関するデータが見つかりませんでした。IDを確認するか、別のエンティティをお試しください。
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
