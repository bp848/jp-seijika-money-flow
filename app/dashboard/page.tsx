"use client"

import { useState } from "react"
import PoliticiansList from "@/components/politicians-list"
import PartiesList from "@/components/parties-list"
import FundOrgsList from "@/components/fund-orgs-list"
import TransactionsList from "@/components/transactions-list"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function DashboardPage() {
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null)
  const [politicianSearchTerm, setPoliticianSearchTerm] = useState("")

  const handlePartySelect = (partyId: string | null) => {
    setSelectedPartyId(partyId)
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-background text-foreground">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
          政治資金データダッシュボード
        </h1>
        <p className="mt-3 text-md text-gray-600 dark:text-gray-400">
          主要な政治活動エンティティの概要と最新の資金移動を表示します。
        </p>
      </header>

      {/* Search bar for politicians - can be expanded for other lists */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="政治家名で検索..."
            className="w-full rounded-lg bg-muted pl-8"
            value={politicianSearchTerm}
            onChange={(e) => setPoliticianSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <PartiesList onPartySelect={handlePartySelect} selectedPartyId={selectedPartyId} />
          <PoliticiansList partyId={selectedPartyId} searchTerm={politicianSearchTerm} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <FundOrgsList /> {/* Add searchTerm prop if search is implemented */}
          <TransactionsList /> {/* Add searchTerm prop if search is implemented */}
        </div>
      </div>
    </div>
  )
}
