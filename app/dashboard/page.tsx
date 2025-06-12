"use client"

import { useState } from "react"
import PartyGridDisplay from "@/components/party-grid-display"
import PoliticiansPanel from "@/components/politicians-panel"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function DashboardPage() {
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null)
  const [partySearchTerm, setPartySearchTerm] = useState("")
  const [politicianSearchTerm, setPoliticianSearchTerm] = useState("")

  const handlePartyCardClick = (partyId: string) => {
    setSelectedPartyId((prevId) => (prevId === partyId ? null : partyId))
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-grow container mx-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">政治データダッシュボード</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="政党名で検索..."
                className="w-full rounded-lg bg-muted pl-8"
                value={partySearchTerm}
                onChange={(e) => setPartySearchTerm(e.target.value)}
              />
            </div>
            <PartyGridDisplay
              searchTerm={partySearchTerm}
              onPartyCardClick={handlePartyCardClick}
              selectedPartyId={selectedPartyId}
            />
          </div>

          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
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
            <PoliticiansPanel partyId={selectedPartyId} searchTerm={politicianSearchTerm} />
          </div>
        </div>
      </main>
    </div>
  )
}
