"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Building, FileText, TrendingUp } from "lucide-react"
import PoliticiansList from "@/components/politicians-list"
import PartiesList from "@/components/parties-list"

interface Politician {
  id: string
  name: string
  name_kana: string
  party: string
  electoral_district: string
  election_count: number
  prefecture: string
  position?: string
  legislature: string
  term_end_date?: string
  photo_url?: string
  profile_url?: string
  current_positions?: string
}

interface Party {
  name: string
  member_count: number
  representatives: Array<{
    name: string
    position?: string
    legislature: string
    electoral_district: string
    photo_url?: string
  }>
  legislature_breakdown: Array<{
    legislature: string
    count: number
  }>
}

export default function DirectoryPage() {
  const [selectedPolitician, setSelectedPolitician] = useState<Politician | null>(null)
  const [selectedParty, setSelectedParty] = useState<Party | null>(null)
  const [activeTab, setActiveTab] = useState("politicians")

  // 政治家詳細表示
  if (selectedPolitician) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedPolitician(null)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            一覧に戻る
          </Button>
          <h1 className="text-3xl font-bold">政治家詳細</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 基本情報 */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                基本情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                {selectedPolitician.photo_url && (
                  <img
                    src={selectedPolitician.photo_url || "/placeholder.svg"}
                    alt={selectedPolitician.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                  />
                )}
                <h2 className="text-2xl font-bold">{selectedPolitician.name}</h2>
                <p className="text-muted-foreground">{selectedPolitician.name_kana}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">{selectedPolitician.party}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedPolitician.legislature === "house_of_councillors" ? "参議院" : "衆議院"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm">選挙区:</span>
                  <span>{selectedPolitician.electoral_district}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm">当選回数:</span>
                  <Badge variant="outline">{selectedPolitician.election_count}回</Badge>
                </div>

                {selectedPolitician.current_positions && (
                  <div>
                    <span className="text-sm text-muted-foreground">現在の役職:</span>
                    <p className="text-sm mt-1">{selectedPolitician.current_positions}</p>
                  </div>
                )}

                {selectedPolitician.profile_url && (
                  <Button asChild className="w-full">
                    <a href={selectedPolitician.profile_url} target="_blank" rel="noopener noreferrer">
                      公式プロフィール
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 関連データ */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  関連する政治資金データ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {selectedPolitician.name}に関連する政治資金の流れを表示します。
                  <br />
                  実装中...
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  関連文書・活動履歴
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  質問主意書、委員会活動、法案提出履歴などを表示します。
                  <br />
                  実装中...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // 政党詳細表示
  if (selectedParty) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedParty(null)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            一覧に戻る
          </Button>
          <h1 className="text-3xl font-bold">政党詳細</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 政党基本情報 */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {selectedParty.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{selectedParty.member_count}</p>
                <p className="text-muted-foreground">総議員数</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">議会別内訳</h4>
                <div className="space-y-2">
                  {selectedParty.legislature_breakdown.map((breakdown) => (
                    <div key={breakdown.legislature} className="flex justify-between">
                      <span className="text-sm">
                        {breakdown.legislature === "house_of_councillors"
                          ? "参議院"
                          : breakdown.legislature === "house_of_representatives"
                            ? "衆議院"
                            : "地方議会"}
                      </span>
                      <Badge variant="outline">{breakdown.count}名</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 所属議員・関連データ */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>主要議員</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedParty.representatives.map((rep, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <img
                        src={rep.photo_url || "/placeholder.svg"}
                        alt={rep.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{rep.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {rep.legislature === "house_of_councillors" ? "参議院" : "衆議院"} {rep.electoral_district}
                        </p>
                        {rep.position && <p className="text-xs text-blue-600">{rep.position}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  政党関連の政治資金データ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {selectedParty.name}に関連する政治資金団体、献金データを表示します。
                  <br />
                  実装中...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // メイン一覧表示
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">政治家・政党ディレクトリ</h1>
        <p className="text-muted-foreground">
          国会議員、政党の情報を検索・参照できます。政治資金データとの関連分析も可能です。
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="politicians" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            政治家一覧
          </TabsTrigger>
          <TabsTrigger value="parties" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            政党一覧
          </TabsTrigger>
        </TabsList>

        <TabsContent value="politicians">
          <PoliticiansList onPoliticianSelect={setSelectedPolitician} />
        </TabsContent>

        <TabsContent value="parties">
          <PartiesList onPartySelect={setSelectedParty} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
