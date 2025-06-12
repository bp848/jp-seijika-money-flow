"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AiChat from "@/components/ai-chat"
import AnalysisHistory from "@/components/analysis-history"
import EntityDetailPanel from "@/components/entity-detail-panel"
import type { AnalysisHistoryItem, CytoscapeNodeData, Transaction } from "@/types"
import { Bot, History, Target } from "lucide-react"

interface RightSidebarProps {
  history: AnalysisHistoryItem[]
  selectedNode: CytoscapeNodeData | null
  allTransactions: Transaction[]
  activeTab: string
  setActiveTab: (tab: string) => void
  onSelectTransaction: (transaction: Transaction) => void
}

export default function RightSidebar({
  history,
  selectedNode,
  allTransactions,
  activeTab,
  setActiveTab,
  onSelectTransaction,
}: RightSidebarProps) {
  return (
    <aside className="w-96 bg-white dark:bg-gray-950 border-l flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
        <div className="p-2 border-b">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">
              <Bot className="mr-2 h-4 w-4" />
              AIチャット
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="mr-2 h-4 w-4" />
              分析履歴
            </TabsTrigger>
            <TabsTrigger value="entity-detail" disabled={!selectedNode}>
              <Target className="mr-2 h-4 w-4" />
              選択エンティティ
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="chat" className="flex-1 overflow-hidden">
          <AiChat />
        </TabsContent>
        <TabsContent value="history" className="flex-1 overflow-hidden">
          <AnalysisHistory history={history} />
        </TabsContent>
        <TabsContent value="entity-detail" className="flex-1 overflow-hidden">
          <EntityDetailPanel
            node={selectedNode}
            transactions={allTransactions}
            onSelectTransaction={onSelectTransaction}
          />
        </TabsContent>
      </Tabs>
    </aside>
  )
}
