"use client"

import { useState } from "react"
import PoliticiansList from "@/components/politicians-list"
import PartiesList from "@/components/parties-list"

export default function PoliticalDataPage() {
  // ここで選択された政党IDを状態として保持する。これが連携の核だ。
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null)

  // PartiesListからの選択イベントを処理するハンドラ
  const handlePartySelect = (partyId: string | null) => {
    setSelectedPartyId(partyId)
  }

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">政治データダッシュボード</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 政党リスト (1列分) */}
        <div className="md:col-span-1">
          <PartiesList selectedPartyId={selectedPartyId} onPartySelect={handlePartySelect} />
        </div>
        {/* 政治家リスト (2列分)。選択された政党IDをフィルターとして渡す。 */}
        <div className="md:col-span-2">
          <PoliticiansList partyId={selectedPartyId} />
        </div>
      </div>
    </div>
  )
}
