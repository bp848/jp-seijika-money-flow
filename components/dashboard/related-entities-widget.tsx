// components/dashboard/related-entities-widget.tsx
"use client"

import { Badge } from "@/components/ui/badge"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LinkIcon, Users, Landmark } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface RelatedEntity {
  id: string
  name: string
  type: "political_funds" | "party_branches" // Example types
  role: "representative" | "treasurer"
}

// Placeholder data - replace with actual data fetching logic
const fetchRelatedEntities = async (entityId: string): Promise<RelatedEntity[]> => {
  console.log(`Fetching related entities for ${entityId}`)
  await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call
  return [
    { id: "fund1", name: "山田太郎後援会", type: "political_funds", role: "representative" },
    { id: "branch1", name: "革新未来党 東京都第1支部", type: "party_branches", role: "representative" },
    { id: "fund2", name: "明日のための政策研究会", type: "political_funds", role: "treasurer" },
  ]
}

export function RelatedEntitiesWidget({ entityId }: { entityId: string }) {
  const [entities, setEntities] = useState<RelatedEntity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRelatedEntities(entityId).then((data) => {
      setEntities(data)
      setLoading(false)
    })
  }, [entityId])

  const getEntityIcon = (type: RelatedEntity["type"]) => {
    if (type === "political_funds") return <Landmark className="h-4 w-4 mr-2 text-cyan-400" />
    if (type === "party_branches") return <Users className="h-4 w-4 mr-2 text-cyan-400" />
    return <LinkIcon className="h-4 w-4 mr-2 text-cyan-400" />
  }

  if (loading) {
    return (
      <Card className="bg-gray-800/70 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-white">関連団体 (Related Entities)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-700 rounded animate-pulse" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800/70 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl text-white">関連団体 (Related Entities)</CardTitle>
      </CardHeader>
      <CardContent>
        {entities.length > 0 ? (
          <ul className="space-y-3">
            {entities.map((entity) => (
              <li
                key={entity.id}
                className="p-3 bg-gray-700/50 rounded-md border border-gray-600 hover:bg-gray-700 transition-colors"
              >
                <Link href={`/explorer/${entity.type}/${entity.id}`} passHref>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-left text-gray-200 hover:text-cyan-300 w-full justify-start"
                  >
                    <div className="flex items-center">
                      {getEntityIcon(entity.type)}
                      <span className="flex-1">{entity.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs border-gray-500 text-gray-400">
                        {entity.role === "representative" ? "代表者" : "会計責任者"}
                      </Badge>
                    </div>
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">関連する団体はありません。</p>
        )}
      </CardContent>
    </Card>
  )
}
