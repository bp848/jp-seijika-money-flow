"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ArrowRight, Calendar, DollarSign, AlertCircle } from "lucide-react"
import { useTransactions } from "@/hooks/use-transactions"
import { useDebounce } from "@/hooks/use-debounce"
import type { Transaction } from "@/types/database"

const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  const router = useRouter()

  const handleEntityClick = useCallback(
    (entityId: string | null, entityName: string) => {
      if (!entityId) {
        console.warn(`Entity ID not found for: ${entityName}`)
        return
      }
      router.push(`/politician-dashboard/${entityId}`)
    },
    [router],
  )

  const getTransactionTypeColor = useCallback((type: string) => {
    switch (type) {
      case "寄付":
        return "bg-green-100 text-green-800 border-green-200"
      case "支出":
        return "bg-red-100 text-red-800 border-red-200"
      case "移転":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }, [])

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex items-center space-x-2">
              {transaction.source_entity_id ? (
                <Button
                  variant="link"
                  className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
                  onClick={() => handleEntityClick(transaction.source_entity_id, transaction.source_entity)}
                >
                  {transaction.source_entity}
                </Button>
              ) : (
                <span className="font-medium text-gray-600 cursor-not-allowed" title="詳細情報なし">
                  {transaction.source_entity}
                </span>
              )}
              <ArrowRight className="h-4 w-4 text-gray-400" />
              {transaction.target_entity_id ? (
                <Button
                  variant="link"
                  className="p-0 h-auto font-medium text-green-600 hover:text-green-800"
                  onClick={() => handleEntityClick(transaction.target_entity_id, transaction.target_entity)}
                >
                  {transaction.target_entity}
                </Button>
              ) : (
                <span className="font-medium text-gray-600 cursor-not-allowed" title="詳細情報なし">
                  {transaction.target_entity}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="font-bold text-lg">¥{transaction.amount.toLocaleString()}</span>
            </div>
            <Badge className={getTransactionTypeColor(transaction.transaction_type)}>
              {transaction.transaction_type}
            </Badge>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{new Date(transaction.occurred_on).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const SkeletonLoader = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <Card key={i}>
        <CardContent className="p-4">
          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </CardContent>
      </Card>
    ))}
  </div>
)

export default function TransactionsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const { transactions, isLoading, isError } = useTransactions({
    searchTerm: debouncedSearchTerm,
    typeFilter,
    limit: 100,
  })

  const renderContent = () => {
    if (isLoading) {
      return <SkeletonLoader />
    }
    if (isError) {
      return (
        <div className="flex items-center justify-center p-8 text-red-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          データの取得に失敗しました
        </div>
      )
    }
    if (!transactions || transactions.length === 0) {
      return <div className="text-center p-8 text-gray-500">検索条件に一致する取引が見つかりませんでした</div>
    }
    return (
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="送金元または送金先で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="取引種別で絞り込み" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="寄付">寄付</SelectItem>
            <SelectItem value="支出">支出</SelectItem>
            <SelectItem value="移転">移転</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {renderContent()}
    </div>
  )
}
