"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TimelineView from "@/components/timeline-view"
import NetworkGraphView from "@/components/network-graph-view"
import type { Transaction, CytoscapeNodeData } from "@/types"
import { GanttChartSquare, GitFork } from "lucide-react"

interface MainViewProps {
  transactions: Transaction[]
  onSelectTransaction: (transaction: Transaction) => void
  onNodeSelect: (nodeData: CytoscapeNodeData) => void
}

export default function MainView({ transactions, onSelectTransaction, onNodeSelect }: MainViewProps) {
  return (
    <Tabs defaultValue="timeline" className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">分析ビュー</h2>
        <TabsList>
          <TabsTrigger value="timeline">
            <GanttChartSquare className="mr-2 h-4 w-4" />
            タイムライン
          </TabsTrigger>
          <TabsTrigger value="network">
            <GitFork className="mr-2 h-4 w-4" />
            ネットワーク
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="timeline" className="flex-1 overflow-hidden">
        <TimelineView transactions={transactions} onSelectTransaction={onSelectTransaction} />
      </TabsContent>
      <TabsContent value="network" className="flex-1">
        <NetworkGraphView transactions={transactions} onNodeSelect={onNodeSelect} />
      </TabsContent>
    </Tabs>
  )
}
