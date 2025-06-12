"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, LandmarkIcon, CheckSquare, Square } from "lucide-react"
import { useParties, type Party } from "@/hooks/use-parties" // Ensure Party type is exported from hook

interface PartiesListProps {
  onPartySelect: (partyId: string | null) => void
  selectedPartyId: string | null
  // searchTerm?: string; // Add if search functionality is desired for parties
}

export default function PartiesList({ onPartySelect, selectedPartyId }: PartiesListProps) {
  const { parties, isLoading, isError, refetch } = useParties() // Assuming useParties doesn't take searchTerm yet

  const handleSelect = (partyId: string) => {
    if (selectedPartyId === partyId) {
      onPartySelect(null) // Deselect if already selected
    } else {
      onPartySelect(partyId)
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>
      )
    }

    if (isError) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>政党データの取得に失敗。</span>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="ml-2">
              再試行
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    if (!parties || parties.length === 0) {
      return <p className="text-sm text-muted-foreground">該当する政党データはありません。</p>
    }

    return (
      <ul className="space-y-1">
        {parties.map((party: Party) => (
          <li key={party.id}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left h-auto py-1.5 px-2 flex items-center"
              onClick={() => handleSelect(party.id)}
            >
              {selectedPartyId === party.id ? (
                <CheckSquare className="mr-2 h-4 w-4 text-primary" />
              ) : (
                <Square className="mr-2 h-4 w-4 text-muted-foreground" />
              )}
              <span className={selectedPartyId === party.id ? "font-semibold" : ""}>{party.name || "名称不明"}</span>
            </Button>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="flex items-center text-xl">
          <LandmarkIcon className="mr-2 h-5 w-5" />
          政党リスト
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-3">{renderContent()}</ScrollArea>
      </CardContent>
    </Card>
  )
}
