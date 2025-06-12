// src/components/PoliticianItem.tsx
"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import type { Politician } from "@/hooks/use-politicians" // 型をインポート

interface PoliticianItemProps {
  politician: Politician
}

export default function PoliticianItem({ politician }: PoliticianItemProps) {
  return (
    <Link
      href={`/politician-dashboard/${politician.id}`}
      key={politician.id}
      passHref
      legacyBehavior // next/link の子要素が <a> でない場合
    >
      <a className="flex justify-between items-center p-4 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
        <span className="font-medium text-gray-800 dark:text-gray-100">{politician.name}</span>
        <Badge variant={politician.party_name === "無所属" ? "secondary" : "default"}>
          <Users className="w-3 h-3 mr-1.5" />
          {politician.party_name}
        </Badge>
      </a>
    </Link>
  )
}
