"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  ZoomIn,
  ZoomOut,
  Download,
  RefreshCw,
  Search,
  Network,
  BarChart2,
  Clock,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// 可視化パラメータの型定義
interface VisualizationParams {
  type: string
  visualizationType: "network" | "timeline" | "sankey"
  highlight: string[]
  politicians?: string[]
  organizations?: string[]
  parties?: string[]
  timeframe?: { start?: string; end?: string }
  amount?: { min: number | null; max: number | null }
  relatedNodes?: string[]
}

// 資金フローデータの型定義
interface FlowData {
  id: string
  donor: string
  recipient: string
  amount: number
  date: string
  party?: string
  type: string
}

// ノードの型定義
interface Node {
  id: string
  label: string
  type: "politician" | "organization" | "party" | "other"
  value: number
  highlighted: boolean
}

// エッジの型定義
interface Edge {
  id: string
  source: string
  target: string
  value: number
  date: string
  highlighted: boolean
}

export default function FundFlowVisualizer({
  initialParams,
  initialData,
}: {
  initialParams?: VisualizationParams
  initialData?: FlowData[]
}) {
  // 状態管理
  const [activeTab, setActiveTab] = useState<string>("network")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [filteredNodes, setFilteredNodes] = useState<Node[]>([])
  const [filteredEdges, setFilteredEdges] = useState<Edge[]>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 100])
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 100])
  const [maxAmount, setMaxAmount] = useState<number>(1000000)
  const [minDate, setMinDate] = useState<string>("")
  const [maxDate, setMaxDate] = useState<string>("")
  const [nodeTypes, setNodeTypes] = useState<{
    politician: boolean
    organization: boolean
    party: boolean
    other: boolean
  }>({
    politician: true,
    organization: true,
    party: true,
    other: true,
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  // 初期データがある場合は処理
  useEffect(() => {
    if (initialParams && initialData && initialData.length > 0) {
      processFlowData(initialData, initialParams)

      // 可視化タイプに合わせてタブを切り替え
      if (initialParams.visualizationType) {
        setActiveTab(initialParams.visualizationType)
      }
    }
  }, [initialParams, initialData])

  // 資金フローデータの処理
  const processFlowData = (data: FlowData[], params?: VisualizationParams) => {
    setIsLoading(true)

    try {
      // ノードとエッジの抽出
      const nodesMap = new Map<string, Node>()
      const edgesArray: Edge[] = []

      // 日付の範囲を特定
      let minDateValue = new Date()
      let maxDateValue = new Date(0)
      let maxAmountValue = 0

      // データからノードとエッジを生成
      data.forEach((flow) => {
        // 日付の処理
        const flowDate = new Date(flow.date)
        if (flowDate < minDateValue) minDateValue = flowDate
        if (flowDate > maxDateValue) maxDateValue = flowDate

        // 金額の処理
        if (flow.amount > maxAmountValue) maxAmountValue = flow.amount

        // 寄付者ノード
        if (flow.donor && !nodesMap.has(flow.donor)) {
          nodesMap.set(flow.donor, {
            id: flow.donor,
            label: flow.donor,
            type: flow.donor.includes("株式会社") || flow.donor.includes("有限会社") ? "organization" : "other",
            value: 0,
            highlighted: params?.highlight?.includes(flow.donor) || false,
          })
        }

        // 受領者ノード
        if (flow.recipient && !nodesMap.has(flow.recipient)) {
          nodesMap.set(flow.recipient, {
            id: flow.recipient,
            label: flow.recipient,
            type: flow.recipient.includes("議員") ? "politician" : "other",
            value: 0,
            highlighted: params?.highlight?.includes(flow.recipient) || false,
          })
        }

        // 政党ノード
        if (flow.party && !nodesMap.has(flow.party)) {
          nodesMap.set(flow.party, {
            id: flow.party,
            label: flow.party,
            type: "party",
            value: 0,
            highlighted: params?.highlight?.includes(flow.party) || false,
          })
        }

        // ノードの値を更新
        if (flow.donor) {
          const node = nodesMap.get(flow.donor)
          if (node) {
            node.value += flow.amount
            nodesMap.set(flow.donor, node)
          }
        }

        if (flow.recipient) {
          const node = nodesMap.get(flow.recipient)
          if (node) {
            node.value += flow.amount
            nodesMap.set(flow.recipient, node)
          }
        }

        // エッジの作成
        if (flow.donor && flow.recipient) {
          edgesArray.push({
            id: `${flow.donor}-${flow.recipient}-${flow.date}`,
            source: flow.donor,
            target: flow.recipient,
            value: flow.amount,
            date: flow.date,
            highlighted:
              params?.highlight?.includes(flow.donor) || params?.highlight?.includes(flow.recipient) || false,
          })
        }
      })

      // 状態を更新
      setNodes(Array.from(nodesMap.values()))
      setEdges(edgesArray)
      setFilteredNodes(Array.from(nodesMap.values()))
      setFilteredEdges(edgesArray)
      setMaxAmount(maxAmountValue)
      setMinDate(minDateValue.toISOString().split("T")[0])
      setMaxDate(maxDateValue.toISOString().split("T")[0])

      toast({
        title: "データ読み込み完了",
        description: `${nodesMap.size}個のノードと${edgesArray.length}個のエッジを読み込みました`,
      })
    } catch (error) {
      console.error("データ処理エラー:", error)
      toast({
        title: "エラー",
        description: "データの処理中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // フィルター適用
  const applyFilters = () => {
    // 検索フィルター
    let filtered = nodes
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((node) => node.label.toLowerCase().includes(term))
    }

    // ノードタイプフィルター
    filtered = filtered.filter((node) => nodeTypes[node.type])

    // 金額フィルター
    const minAmount = (amountRange[0] / 100) * maxAmount
    const maxAmountValue = (amountRange[1] / 100) * maxAmount
    filtered = filtered.filter((node) => node.value >= minAmount && node.value <= maxAmountValue)

    setFilteredNodes(filtered)

    // エッジフィルター
    const filteredNodeIds = new Set(filtered.map((n) => n.id))
    const filteredEdgesList = edges.filter(
      (edge) => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target),
    )

    // 日付フィルター
    const minDateObj = new Date(minDate)
    const maxDateObj = new Date(maxDate)
    const timeRangeStart = new Date(
      minDateObj.getTime() + (timeRange[0] / 100) * (maxDateObj.getTime() - minDateObj.getTime()),
    )
    const timeRangeEnd = new Date(
      minDateObj.getTime() + (timeRange[1] / 100) * (maxDateObj.getTime() - minDateObj.getTime()),
    )

    const dateFilteredEdges = filteredEdgesList.filter((edge) => {
      const edgeDate = new Date(edge.date)
      return edgeDate >= timeRangeStart && edgeDate <= timeRangeEnd
    })

    setFilteredEdges(dateFilteredEdges)

    // 選択ノードのリセット
    setSelectedNode(null)

    toast({
      title: "フィルター適用",
      description: `${filtered.length}個のノードと${dateFilteredEdges.length}個のエッジが表示されています`,
    })
  }

  // ズームイン
  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2))
  }

  // ズームアウト
  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))
  }

  // リセット
  const resetView = () => {
    setZoomLevel(1)
    setSearchTerm("")
    setNodeTypes({
      politician: true,
      organization: true,
      party: true,
      other: true,
    })
    setTimeRange([0, 100])
    setAmountRange([0, 100])
    setSelectedNode(null)

    // フィルターの再適用
    setFilteredNodes(nodes)
    setFilteredEdges(edges)

    toast({
      title: "ビューをリセットしました",
      description: "すべてのフィルターとズームがリセットされました",
    })
  }

  // 可視化の描画
  useEffect(() => {
    if (!canvasRef.current || filteredNodes.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // キャンバスのサイズ設定
    const container = canvas.parentElement
    if (container) {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 描画関数
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 背景
      ctx.fillStyle = "#f8f9fa"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 描画タイプに応じて処理
      if (activeTab === "network") {
        drawNetworkGraph(ctx, canvas.width, canvas.height)
      } else if (activeTab === "timeline") {
        drawTimeline(ctx, canvas.width, canvas.height)
      } else if (activeTab === "sankey") {
        drawSankeyDiagram(ctx, canvas.width, canvas.height)
      }
    }

    draw()
  }, [filteredNodes, filteredEdges, activeTab, zoomLevel, selectedNode])

  // ネットワークグラフの描画
  const drawNetworkGraph = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (filteredNodes.length === 0) return

    // ノードの位置を計算（簡易的なフォースレイアウト）
    const nodePositions = new Map<string, { x: number; y: number }>()

    // 初期位置を設定
    filteredNodes.forEach((node, i) => {
      const angle = (i / filteredNodes.length) * Math.PI * 2
      const radius = Math.min(width, height) * 0.4 * zoomLevel
      const x = width / 2 + Math.cos(angle) * radius
      const y = height / 2 + Math.sin(angle) * radius
      nodePositions.set(node.id, { x, y })
    })

    // エッジの描画
    ctx.lineWidth = 1
    filteredEdges.forEach((edge) => {
      const sourcePos = nodePositions.get(edge.source)
      const targetPos = nodePositions.get(edge.target)

      if (sourcePos && targetPos) {
        ctx.beginPath()
        ctx.moveTo(sourcePos.x, sourcePos.y)
        ctx.lineTo(targetPos.x, targetPos.y)

        // エッジの色と太さ
        if (
          edge.highlighted ||
          (selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id))
        ) {
          ctx.strokeStyle = "rgba(220, 38, 38, 0.8)" // 強調表示は赤色
          ctx.lineWidth = 2 + (edge.value / maxAmount) * 5
        } else {
          ctx.strokeStyle = "rgba(156, 163, 175, 0.5)" // 通常は灰色
          ctx.lineWidth = 1 + (edge.value / maxAmount) * 3
        }

        ctx.stroke()

        // エッジの金額表示（選択時のみ）
        if (selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id)) {
          const midX = (sourcePos.x + targetPos.x) / 2
          const midY = (sourcePos.y + targetPos.y) / 2

          ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
          ctx.font = "10px sans-serif"
          ctx.fillText(`${edge.value.toLocaleString()}円`, midX, midY)
        }
      }
    })

    // ノードの描画
    filteredNodes.forEach((node) => {
      const pos = nodePositions.get(node.id)
      if (!pos) return

      // ノードのサイズ（金額に比例）
      const minSize = 5
      const maxSize = 20
      const size = minSize + (node.value / maxAmount) * (maxSize - minSize)

      // ノードの色
      let color = "rgba(59, 130, 246, 0.8)" // デフォルト青

      if (node.type === "politician") {
        color = "rgba(16, 185, 129, 0.8)" // 政治家は緑
      } else if (node.type === "organization") {
        color = "rgba(245, 158, 11, 0.8)" // 組織はオレンジ
      } else if (node.type === "party") {
        color = "rgba(139, 92, 246, 0.8)" // 政党は紫
      }

      // 選択または強調表示の場合
      if (selectedNode === node || node.highlighted) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
        ctx.shadowBlur = 10
      } else {
        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
      }

      // ノードの描画
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      // 選択または強調表示の場合は枠線を追加
      if (selectedNode === node || node.highlighted) {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.8)"
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // ノードのラベル
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(node.label, pos.x, pos.y + size + 12)

      // 選択されたノードの場合は金額も表示
      if (selectedNode === node) {
        ctx.fillText(`${node.value.toLocaleString()}円`, pos.x, pos.y + size + 24)
      }
    })
  }

  // タイムラインの描画
  const drawTimeline = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (filteredEdges.length === 0) return

    // タイムラインの設定
    const padding = 50
    const timelineY = height - padding
    const timelineStart = padding
    const timelineEnd = width - padding
    const timelineLength = timelineEnd - timelineStart

    // 日付の範囲
    const minDateObj = new Date(minDate)
    const maxDateObj = new Date(maxDate)
    const timeSpan = maxDateObj.getTime() - minDateObj.getTime()

    // タイムラインの軸を描画
    ctx.beginPath()
    ctx.moveTo(timelineStart, timelineY)
    ctx.lineTo(timelineEnd, timelineY)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)"
    ctx.lineWidth = 2
    ctx.stroke()

    // 目盛りを描画
    const numTicks = 10
    ctx.textAlign = "center"
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.font = "10px sans-serif"

    for (let i = 0; i <= numTicks; i++) {
      const x = timelineStart + (timelineLength * i) / numTicks
      const tickDate = new Date(minDateObj.getTime() + (timeSpan * i) / numTicks)

      ctx.beginPath()
      ctx.moveTo(x, timelineY)
      ctx.lineTo(x, timelineY + 5)
      ctx.stroke()

      ctx.fillText(tickDate.toLocaleDateString(), x, timelineY + 20)
    }

    // イベント（エッジ）を描画
    filteredEdges.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    filteredEdges.forEach((edge) => {
      const edgeDate = new Date(edge.date)
      const timePosition = (edgeDate.getTime() - minDateObj.getTime()) / timeSpan
      const x = timelineStart + timelineLength * timePosition

      // 金額に応じた円のサイズ
      const minSize = 3
      const maxSize = 15
      const size = minSize + (edge.value / maxAmount) * (maxSize - minSize)

      // 円の位置（Y座標）をずらして重ならないようにする
      const y = timelineY - 20 - Math.random() * 100

      // 円を描画
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)

      // 強調表示の場合
      if (edge.highlighted || (selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id))) {
        ctx.fillStyle = "rgba(220, 38, 38, 0.8)" // 強調表示は赤色
      } else {
        ctx.fillStyle = "rgba(59, 130, 246, 0.6)" // 通常は青色
      }

      ctx.fill()

      // 線を描画（タイムラインとイベントを結ぶ）
      ctx.beginPath()
      ctx.moveTo(x, y + size)
      ctx.lineTo(x, timelineY)
      ctx.strokeStyle = "rgba(156, 163, 175, 0.3)"
      ctx.lineWidth = 1
      ctx.stroke()

      // 選択されたノードに関連するエッジの場合、詳細を表示
      if (selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id)) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
        ctx.font = "10px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(`${edge.source} → ${edge.target}`, x, y - size - 5)
        ctx.fillText(`${edge.value.toLocaleString()}円`, x, y - size - 18)
      }
    })
  }

  // サンキーダイアグラムの描画
  const drawSankeyDiagram = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (filteredNodes.length === 0 || filteredEdges.length === 0) return

    // サンキーダイアグラムの設定
    const padding = 50
    const diagramWidth = width - padding * 2
    const diagramHeight = height - padding * 2

    // ノードをタイプ別にグループ化
    const nodesByType = {
      organization: filteredNodes.filter((n) => n.type === "organization"),
      party: filteredNodes.filter((n) => n.type === "party"),
      politician: filteredNodes.filter((n) => n.type === "politician"),
      other: filteredNodes.filter((n) => n.type === "other"),
    }

    // 列の位置を定義
    const columnX = {
      organization: padding,
      party: padding + diagramWidth / 3,
      politician: padding + (diagramWidth / 3) * 2,
      other: padding + diagramWidth,
    }

    // ノードの位置を計算
    const nodePositions = new Map<string, { x: number; y: number; height: number }>()

    // 各タイプごとにノードを配置
    Object.entries(nodesByType).forEach(([type, nodes]) => {
      if (nodes.length === 0) return

      const x = columnX[type as keyof typeof columnX]
      const totalValue = nodes.reduce((sum, node) => sum + node.value, 0)
      const nodeSpacing = 10
      const availableHeight = diagramHeight - nodeSpacing * (nodes.length - 1)

      let currentY = padding

      // 値でソート（大きい順）
      nodes.sort((a, b) => b.value - a.value)

      nodes.forEach((node) => {
        const nodeHeight = Math.max(10, (node.value / totalValue) * availableHeight)
        nodePositions.set(node.id, { x, y: currentY, height: nodeHeight })
        currentY += nodeHeight + nodeSpacing
      })
    })

    // エッジ（フロー）を描画
    filteredEdges.forEach((edge) => {
      const sourcePos = nodePositions.get(edge.source)
      const targetPos = nodePositions.get(edge.target)

      if (sourcePos && targetPos) {
        // フローの太さを計算
        const flowWidth = Math.max(1, (edge.value / maxAmount) * 20)

        // ソースとターゲットの接続点
        const sourceY = sourcePos.y + sourcePos.height / 2
        const targetY = targetPos.y + targetPos.height / 2

        // ベジェ曲線のコントロールポイント
        const cp1x = sourcePos.x + (targetPos.x - sourcePos.x) / 3
        const cp2x = sourcePos.x + ((targetPos.x - sourcePos.x) * 2) / 3

        // ベジェ曲線でフローを描画
        ctx.beginPath()
        ctx.moveTo(sourcePos.x, sourceY)
        ctx.bezierCurveTo(cp1x, sourceY, cp2x, targetY, targetPos.x, targetY)

        // フローの色
        if (
          edge.highlighted ||
          (selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id))
        ) {
          ctx.strokeStyle = "rgba(220, 38, 38, 0.8)" // 強調表示は赤色
        } else {
          ctx.strokeStyle = "rgba(156, 163, 175, 0.5)" // 通常は灰色
        }

        ctx.lineWidth = flowWidth
        ctx.stroke()

        // 選択されたノードに関連するエッジの場合、金額を表示
        if (selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id)) {
          const midX = (sourcePos.x + targetPos.x) / 2
          const midY = (sourceY + targetY) / 2

          ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
          ctx.font = "10px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(`${edge.value.toLocaleString()}円`, midX, midY)
        }
      }
    })

    // ノードを描画
    filteredNodes.forEach((node) => {
      const pos = nodePositions.get(node.id)
      if (!pos) return

      // ノードの色
      let color = "rgba(59, 130, 246, 0.8)" // デフォルト青

      if (node.type === "politician") {
        color = "rgba(16, 185, 129, 0.8)" // 政治家は緑
      } else if (node.type === "organization") {
        color = "rgba(245, 158, 11, 0.8)" // 組織はオレンジ
      } else if (node.type === "party") {
        color = "rgba(139, 92, 246, 0.8)" // 政党は紫
      }

      // 選択または強調表示の場合
      if (selectedNode === node || node.highlighted) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
        ctx.shadowBlur = 10
      } else {
        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
      }

      // ノードの描画
      ctx.beginPath()
      ctx.rect(pos.x - 10, pos.y, 20, pos.height)
      ctx.fillStyle = color
      ctx.fill()

      // 選択または強調表示の場合は枠線を追加
      if (selectedNode === node || node.highlighted) {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.8)"
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // ノードのラベル
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(node.label, pos.x + 25, pos.y + pos.height / 2)

      // 選択されたノードの場合は金額も表示
      if (selectedNode === node) {
        ctx.fillText(`${node.value.toLocaleString()}円`, pos.x + 25, pos.y + pos.height / 2 + 12)
      }
    })

    // 列のラベルを描画
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.font = "bold 12px sans-serif"
    ctx.textAlign = "center"

    ctx.fillText("企業・団体", columnX.organization, padding - 20)
    ctx.fillText("政党", columnX.party, padding - 20)
    ctx.fillText("政治家", columnX.politician, padding - 20)
  }

  // キャンバスクリックイベント
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || filteredNodes.length === 0) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // ノードの位置を計算（描画関数と同じロジック）
    // 実際の実装では、描画関数と位置計算を共通化するとよい

    // 簡易的な実装として、クリック位置から最も近いノードを選択
    let closestNode: Node | null = null
    let minDistance = Number.POSITIVE_INFINITY

    filteredNodes.forEach((node) => {
      // ノードの位置は描画関数と同じロジックで計算する必要がある
      // ここでは簡易的に中心からの距離で判定
      const distance = Math.sqrt(Math.pow(x - canvas.width / 2, 2) + Math.pow(y - canvas.height / 2, 2))

      if (distance < minDistance) {
        minDistance = distance
        closestNode = node
      }
    })

    // 閾値内ならノードを選択
    if (minDistance < 50) {
      setSelectedNode(closestNode)
    } else {
      setSelectedNode(null)
    }
  }

  // SVGエクスポート
  const exportSVG = () => {
    // 実装省略（キャンバスの内容をSVGに変換する処理）
    toast({
      title: "エクスポート機能",
      description: "この機能は現在実装中です",
    })
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>資金フロービジュアライザー</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={zoomIn} disabled={isLoading}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={zoomOut} disabled={isLoading}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetView} disabled={isLoading}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={exportSVG} disabled={isLoading}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="network" className="flex items-center">
            <Network className="h-4 w-4 mr-2" />
            ネットワーク
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            タイムライン
          </TabsTrigger>
          <TabsTrigger value="sankey" className="flex items-center">
            <BarChart2 className="h-4 w-4 mr-2" />
            資金フロー
          </TabsTrigger>
        </TabsList>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 p-4 border-r overflow-y-auto">
            <div className="space-y-4">
              <div>
                <Label htmlFor="search">検索</Label>
                <div className="flex mt-1">
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ノード名で検索..."
                  />
                  <Button variant="ghost" size="icon" onClick={() => applyFilters()}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>ノードタイプ</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="politician"
                      checked={nodeTypes.politician}
                      onChange={(e) => setNodeTypes({ ...nodeTypes, politician: e.target.checked })}
                    />
                    <Label htmlFor="politician" className="text-sm">
                      政治家
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="organization"
                      checked={nodeTypes.organization}
                      onChange={(e) => setNodeTypes({ ...nodeTypes, organization: e.target.checked })}
                    />
                    <Label htmlFor="organization" className="text-sm">
                      企業・団体
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="party"
                      checked={nodeTypes.party}
                      onChange={(e) => setNodeTypes({ ...nodeTypes, party: e.target.checked })}
                    />
                    <Label htmlFor="party" className="text-sm">
                      政党
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="other"
                      checked={nodeTypes.other}
                      onChange={(e) => setNodeTypes({ ...nodeTypes, other: e.target.checked })}
                    />
                    <Label htmlFor="other" className="text-sm">
                      その他
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label>期間</Label>
                <div className="mt-1">
                  <Slider
                    value={timeRange}
                    onValueChange={(value) => setTimeRange(value as [number, number])}
                    min={0}
                    max={100}
                    step={1}
                    className="my-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{minDate ? new Date(minDate).toLocaleDateString() : "開始"}</span>
                    <span>{maxDate ? new Date(maxDate).toLocaleDateString() : "終了"}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>金額範囲</Label>
                <div className="mt-1">
                  <Slider
                    value={amountRange}
                    onValueChange={(value) => setAmountRange(value as [number, number])}
                    min={0}
                    max={100}
                    step={1}
                    className="my-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0円</span>
                    <span>{maxAmount.toLocaleString()}円</span>
                  </div>
                </div>
              </div>

              <Button onClick={applyFilters} className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                フィルター適用
              </Button>

              {selectedNode && (
                <div className="mt-4 p-3 border rounded-md">
                  <h4 className="font-medium mb-1">{selectedNode.label}</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>タイプ:</span>
                      <Badge variant="outline">
                        {selectedNode.type === "politician"
                          ? "政治家"
                          : selectedNode.type === "organization"
                            ? "企業・団体"
                            : selectedNode.type === "party"
                              ? "政党"
                              : "その他"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>金額:</span>
                      <span>{selectedNode.value.toLocaleString()}円</span>
                    </div>
                    <div className="flex justify-between">
                      <span>関連エッジ:</span>
                      <span>
                        {
                          filteredEdges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                            .length
                        }
                        件
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredNodes.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">データがありません</h3>
                  <p className="max-w-md">表示するデータがないか、フィルター条件に一致するデータがありません。</p>
                </div>
              </div>
            ) : (
              <canvas ref={canvasRef} className="w-full h-full" onClick={handleCanvasClick} />
            )}
          </div>
        </div>
      </Tabs>
    </Card>
  )
}
