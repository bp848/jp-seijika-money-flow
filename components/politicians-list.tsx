// src/components/PoliticiansList.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation" // コメントアウト解除
import { usePoliticians } from "@/hooks/use-politicians"
import { useDebounce } from "@/hooks/use-debounce"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, User, AlertTriangle } from "lucide-react"
import PoliticianItem from "./politician-item" // PoliticianItemをインポート

// スケルトンコンポーネント (変更なし)
const PoliticianSkeleton = () => (
  <div className="p-4 border-b border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
      <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
    </div>
  </div>
)

export default function PoliticiansList() {
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const { politicians, isLoading, isError } = usePoliticians({
    searchTerm: debouncedSearchTerm,
  })
  const router = useRouter() // コメントアウト解除

  const renderContent = () => {
    if (isLoading) {
      return (
        <div>
          {[...Array(5)].map((_, i) => (
            <PoliticianSkeleton key={i} />
          ))}
        </div>
      )
    }
    if (isError) {
      return (
        <div className="p-4 text-center text-red-600 dark:text-red-400 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          データの読み込みに失敗しました。
        </div>
      )
    }
    if (!politicians || politicians.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">該当する政治家が見つかりませんでした。</div>
      )
    }
    return politicians.map((politician) => <PoliticianItem key={politician.id} politician={politician} />)
  }

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
          <User className="w-6 h-6 mr-2" />
          政治家リスト
        </CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="政治家名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="border border-gray-200 dark:border-gray-700 rounded-md">{renderContent()}</div>
      </CardContent>
    </Card>
  )
}
