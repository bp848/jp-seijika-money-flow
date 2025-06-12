"use client"

import type { CytoscapeNodeData, Transaction, EntityType } from "@/types"
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Users,
  Landmark,
  Factory,
  Briefcase,
  Globe,
  Heart,
  Shield,
  Star,
  Diamond,
  Triangle,
  Circle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface EntityDetailPanelProps {
  node: CytoscapeNodeData | null
  transactions: Transaction[]
  onSelectTransaction: (transaction: Transaction) => void
}

// エンティティタイプの日本語名と詳細情報
const getEntityInfo = (type: EntityType) => {
  const entityMap = {
    politician_individual: {
      name: "個人政治家",
      description: "国会議員、地方議員などの個人政治家",
      icon: Star,
      color: "bg-red-500",
      category: "政治",
      importance: "最高",
      shape: "星形",
    },
    politician_group: {
      name: "政治家グループ",
      description: "複数の政治家で構成される政治団体",
      icon: Users,
      color: "bg-red-400",
      category: "政治",
      importance: "高",
      shape: "星形",
    },
    party_headquarters: {
      name: "政党本部",
      description: "政党の中央組織・本部機能",
      icon: Landmark,
      color: "bg-teal-500",
      category: "政治",
      importance: "最高",
      shape: "六角形",
    },
    party_branch: {
      name: "政党支部",
      description: "政党の地方組織・支部",
      icon: Landmark,
      color: "bg-teal-400",
      category: "政治",
      importance: "中",
      shape: "六角形",
    },
    support_group: {
      name: "後援会",
      description: "政治家を支援する後援会組織",
      icon: Heart,
      color: "bg-blue-500",
      category: "政治",
      importance: "中",
      shape: "円形",
    },
    large_corporation: {
      name: "大企業",
      description: "従業員数1000人以上の大規模企業",
      icon: Building2,
      color: "bg-green-500",
      category: "企業",
      importance: "高",
      shape: "四角形",
    },
    medium_corporation: {
      name: "中企業",
      description: "従業員数100-1000人の中規模企業",
      icon: Building2,
      color: "bg-green-400",
      category: "企業",
      importance: "中",
      shape: "四角形",
    },
    small_corporation: {
      name: "小企業",
      description: "従業員数100人未満の小規模企業",
      icon: Building2,
      color: "bg-green-300",
      category: "企業",
      importance: "低",
      shape: "四角形",
    },
    financial_institution: {
      name: "金融機関",
      description: "銀行、証券会社、保険会社など",
      icon: Diamond,
      color: "bg-yellow-500",
      category: "金融",
      importance: "高",
      shape: "ダイヤモンド",
    },
    construction_company: {
      name: "建設会社",
      description: "建設業、土木工事業などの企業",
      icon: Factory,
      color: "bg-pink-500",
      category: "建設",
      importance: "中",
      shape: "円形",
    },
    tech_company: {
      name: "IT企業",
      description: "情報技術、ソフトウェア関連企業",
      icon: Triangle,
      color: "bg-emerald-500",
      category: "技術",
      importance: "中",
      shape: "三角形",
    },
    media_company: {
      name: "メディア企業",
      description: "新聞社、放送局、出版社など",
      icon: Globe,
      color: "bg-purple-500",
      category: "メディア",
      importance: "中",
      shape: "円形",
    },
    labor_union: {
      name: "労働組合",
      description: "労働者の権利保護組織",
      icon: Users,
      color: "bg-sky-500",
      category: "組織",
      importance: "中",
      shape: "円形",
    },
    industry_association: {
      name: "業界団体",
      description: "特定業界の企業で構成される団体",
      icon: Briefcase,
      color: "bg-amber-600",
      category: "組織",
      importance: "中",
      shape: "円形",
    },
    npo_organization: {
      name: "NPO団体",
      description: "非営利組織、市民団体など",
      icon: Heart,
      color: "bg-lime-500",
      category: "非営利",
      importance: "低",
      shape: "円形",
    },
    service_provider: {
      name: "サービス提供者",
      description: "各種サービス業、会場運営など",
      icon: Circle,
      color: "bg-gray-400",
      category: "サービス",
      importance: "低",
      shape: "円形",
    },
    government_agency: {
      name: "政府機関",
      description: "省庁、政府関連機関",
      icon: Shield,
      color: "bg-indigo-600",
      category: "政府",
      importance: "高",
      shape: "円形",
    },
    unknown: {
      name: "不明",
      description: "分類不明なエンティティ",
      icon: Circle,
      color: "bg-gray-500",
      category: "その他",
      importance: "低",
      shape: "円形",
    },
  }

  return entityMap[type] || entityMap.unknown
}

// 重要度に応じたバッジの色を取得
const getImportanceBadgeColor = (importance: string) => {
  switch (importance) {
    case "最高":
      return "bg-red-500 text-white"
    case "高":
      return "bg-orange-500 text-white"
    case "中":
      return "bg-yellow-500 text-black"
    case "低":
      return "bg-gray-500 text-white"
    default:
      return "bg-gray-400 text-white"
  }
}

// カテゴリに応じたバッジの色を取得
const getCategoryBadgeColor = (category: string) => {
  switch (category) {
    case "政治":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "企業":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "金融":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    case "建設":
      return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
    case "技術":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
    case "メディア":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    case "組織":
      return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200"
    case "非営利":
      return "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200"
    case "サービス":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    case "政府":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

// 取引の分析情報を生成
const getTransactionAnalysis = (transactions: Transaction[], nodeId: string) => {
  const relatedTransactions = transactions.filter((tx) => tx.from === nodeId || tx.to === nodeId)

  const totalIncome = relatedTransactions.filter((tx) => tx.to === nodeId).reduce((sum, tx) => sum + tx.amount, 0)
  const totalExpense = relatedTransactions.filter((tx) => tx.from === nodeId).reduce((sum, tx) => sum + tx.amount, 0)
  const netFlow = totalIncome - totalExpense

  const incomeTransactions = relatedTransactions.filter((tx) => tx.to === nodeId)
  const expenseTransactions = relatedTransactions.filter((tx) => tx.from === nodeId)

  const avgIncomeAmount = incomeTransactions.length > 0 ? totalIncome / incomeTransactions.length : 0
  const avgExpenseAmount = expenseTransactions.length > 0 ? totalExpense / expenseTransactions.length : 0

  // 最大の取引を特定
  const largestIncome = incomeTransactions.reduce((max, tx) => (tx.amount > max.amount ? tx : max), {
    amount: 0,
    from: "",
    to: "",
    date: "",
    id: "",
    type: "income" as const,
    description: "",
    documentUrl: "",
  })
  const largestExpense = expenseTransactions.reduce((max, tx) => (tx.amount > max.amount ? tx : max), {
    amount: 0,
    from: "",
    to: "",
    date: "",
    id: "",
    type: "expense" as const,
    description: "",
    documentUrl: "",
  })

  return {
    totalIncome,
    totalExpense,
    netFlow,
    avgIncomeAmount,
    avgExpenseAmount,
    largestIncome: largestIncome.amount > 0 ? largestIncome : null,
    largestExpense: largestExpense.amount > 0 ? largestExpense : null,
    transactionCount: relatedTransactions.length,
    incomeCount: incomeTransactions.length,
    expenseCount: expenseTransactions.length,
  }
}

export default function EntityDetailPanel({ node, transactions, onSelectTransaction }: EntityDetailPanelProps) {
  if (!node) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <Circle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">ノードを選択してください</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            ネットワークグラフでノードをクリックすると詳細情報が表示されます
          </p>
        </div>
      </div>
    )
  }

  const entityInfo = getEntityInfo(node.type)
  const IconComponent = entityInfo.icon
  const analysis = getTransactionAnalysis(transactions, node.id)
  const relatedTransactions = transactions.filter((tx) => tx.from === node.id || tx.to === node.id)

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pt-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg", entityInfo.color)}>
            <IconComponent className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight">{node.label}</CardTitle>
            <CardDescription className="text-sm mt-1">{entityInfo.description}</CardDescription>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className={getCategoryBadgeColor(entityInfo.category)}>{entityInfo.category}</Badge>
              <Badge className={getImportanceBadgeColor(entityInfo.importance)}>重要度: {entityInfo.importance}</Badge>
              <Badge variant="outline" className="text-xs">
                {entityInfo.shape}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden px-4 pb-4">
        {/* 統計情報セクション */}
        <div className="mt-4 space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            資金フロー分析
          </h4>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs text-green-700 dark:text-green-400 font-medium">総収入</p>
              <p className="font-bold text-green-600 dark:text-green-300">¥{analysis.totalIncome.toLocaleString()}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">{analysis.incomeCount}件</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs text-red-700 dark:text-red-400 font-medium">総支出</p>
              <p className="font-bold text-red-600 dark:text-red-300">¥{analysis.totalExpense.toLocaleString()}</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{analysis.expenseCount}件</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">純資金フロー</p>
            <p
              className={cn(
                "font-bold text-lg",
                analysis.netFlow >= 0 ? "text-green-600 dark:text-green-300" : "text-red-600 dark:text-red-300",
              )}
            >
              {analysis.netFlow >= 0 ? "+" : ""}¥{analysis.netFlow.toLocaleString()}
            </p>
          </div>

          {/* 平均取引額 */}
          {(analysis.avgIncomeAmount > 0 || analysis.avgExpenseAmount > 0) && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {analysis.avgIncomeAmount > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <p className="text-gray-600 dark:text-gray-400">平均収入額</p>
                  <p className="font-semibold">¥{Math.round(analysis.avgIncomeAmount).toLocaleString()}</p>
                </div>
              )}
              {analysis.avgExpenseAmount > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <p className="text-gray-600 dark:text-gray-400">平均支出額</p>
                  <p className="font-semibold">¥{Math.round(analysis.avgExpenseAmount).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}

          {/* 最大取引 */}
          {(analysis.largestIncome || analysis.largestExpense) && (
            <div className="space-y-2">
              <h5 className="font-medium text-xs text-gray-600 dark:text-gray-400">最大取引</h5>
              {analysis.largestIncome && (
                <div className="text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded border-l-2 border-green-500">
                  <p className="font-medium text-green-700 dark:text-green-300">
                    最大収入: ¥{analysis.largestIncome.amount.toLocaleString()}
                  </p>
                  <p className="text-green-600 dark:text-green-400">From: {analysis.largestIncome.from}</p>
                </div>
              )}
              {analysis.largestExpense && (
                <div className="text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded border-l-2 border-red-500">
                  <p className="font-medium text-red-700 dark:text-red-300">
                    最大支出: ¥{analysis.largestExpense.amount.toLocaleString()}
                  </p>
                  <p className="text-red-600 dark:text-red-400">To: {analysis.largestExpense.to}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* トランザクション一覧 */}
        <div className="mt-4">
          <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
            <ArrowDownLeft className="h-4 w-4" />
            関連トランザクション ({analysis.transactionCount}件)
          </h4>

          {relatedTransactions.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">関連するトランザクションはありません。</p>
          ) : (
            <ScrollArea className="h-[calc(100vh-600px)] min-h-[200px]">
              <div className="space-y-2 pr-2">
                {relatedTransactions
                  .sort((a, b) => b.amount - a.amount) // 金額の大きい順にソート
                  .map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => onSelectTransaction(tx)}
                      className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium truncate flex-1 mr-2">
                          {tx.from === node.id ? `→ ${tx.to}` : `← ${tx.from}`}
                        </span>
                        <span
                          className={cn(
                            "font-bold flex items-center gap-1 flex-shrink-0",
                            tx.to === node.id ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                          )}
                        >
                          {tx.to === node.id ? (
                            <ArrowDownLeft className="h-3 w-3" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3" />
                          )}
                          ¥{tx.amount.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-[11px] leading-relaxed">
                        {new Date(tx.date).toLocaleDateString("ja-JP")} - {tx.description}
                      </p>
                      {/* 取引の重要度インジケーター */}
                      {tx.amount > 1000000 && (
                        <Badge variant="outline" className="mt-1 text-[10px] h-4">
                          高額取引
                        </Badge>
                      )}
                    </div>
                  ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </div>
  )
}
