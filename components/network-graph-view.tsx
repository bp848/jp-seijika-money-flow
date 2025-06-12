"use client"

import { useEffect, useRef } from "react"
import cytoscape from "cytoscape"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Transaction, CytoscapeNodeData, EntityType } from "@/types"

interface NetworkGraphViewProps {
  transactions: Transaction[]
  onNodeSelect: (nodeData: CytoscapeNodeData | null) => void
}

// getNodeType関数を大幅に拡張
const getNodeType = (name: string): EntityType => {
  // 政治家・政党関連
  if (name.includes("総理") || name.includes("大臣") || name.includes("党首")) return "politician_individual"
  if (name.includes("政治家") || (name.includes("議員") && name.includes("会"))) return "politician_group"
  if (name.includes("党本部") || name.includes("本部")) return "party_headquarters"
  if (name.includes("党") && name.includes("支部")) return "party_branch"
  if (name.includes("後援会") || name.includes("政治団体")) return "support_group"

  // 企業関連
  if (name.includes("銀行") || name.includes("信用金庫") || name.includes("証券")) return "financial_institution"
  if (name.includes("建設") || name.includes("工業") || name.includes("重工")) return "construction_company"
  if (name.includes("IT") || name.includes("テクノ") || name.includes("システム") || name.includes("ソフト"))
    return "tech_company"
  if (name.includes("新聞") || name.includes("放送") || name.includes("メディア") || name.includes("テレビ"))
    return "media_company"
  if (name.includes("株式会社") && (name.includes("大手") || name.includes("グループ"))) return "large_corporation"
  if (name.includes("株式会社")) return "medium_corporation"
  if (name.includes("有限会社") || name.includes("合同会社")) return "small_corporation"

  // 組織・団体関連
  if (name.includes("労働組合") || name.includes("組合")) return "labor_union"
  if (name.includes("連合会") || name.includes("協会") || name.includes("連盟")) return "industry_association"
  if (name.includes("NPO") || name.includes("財団") || name.includes("社団")) return "npo_organization"
  if (name.includes("省") || name.includes("庁") || name.includes("局")) return "government_agency"
  if (name.includes("サービス") || name.includes("ホール") || name.includes("会場")) return "service_provider"

  return "unknown"
}

interface NodeSizeConfig {
  radius: number
  importance: number
}

// ノードサイズを決定する関数を追加
const getNodeSize = (type: EntityType, connections: number): NodeSizeConfig => {
  const baseSize = {
    politician_individual: { radius: 12, importance: 10 },
    politician_group: { radius: 10, importance: 8 },
    party_headquarters: { radius: 14, importance: 9 },
    party_branch: { radius: 8, importance: 6 },
    support_group: { radius: 9, importance: 7 },
    large_corporation: { radius: 11, importance: 8 },
    medium_corporation: { radius: 8, importance: 6 },
    small_corporation: { radius: 6, importance: 4 },
    financial_institution: { radius: 10, importance: 8 },
    construction_company: { radius: 9, importance: 7 },
    tech_company: { radius: 9, importance: 7 },
    media_company: { radius: 8, importance: 6 },
    labor_union: { radius: 7, importance: 5 },
    industry_association: { radius: 8, importance: 6 },
    npo_organization: { radius: 6, importance: 4 },
    service_provider: { radius: 5, importance: 3 },
    government_agency: { radius: 10, importance: 8 },
    unknown: { radius: 5, importance: 3 },
  }

  const config = baseSize[type]
  // 接続数に応じてサイズを調整（最大50%増加）
  const connectionMultiplier = Math.min(1.5, 1 + connections * 0.1)

  return {
    radius: config.radius * connectionMultiplier,
    importance: config.importance,
  }
}

// ノードの色を決定する関数を拡張
const getNodeColor = (type: EntityType): string => {
  switch (type) {
    case "politician_individual":
      return "#ff6b6b" // 赤系 - 個人政治家
    case "politician_group":
      return "#ff8e8e" // 薄い赤 - 政治家グループ
    case "party_headquarters":
      return "#4ecdc4" // ティール - 政党本部
    case "party_branch":
      return "#7fdbda" // 薄いティール - 政党支部
    case "support_group":
      return "#45b7d1" // 青 - 後援会
    case "large_corporation":
      return "#96ceb4" // 緑 - 大企業
    case "medium_corporation":
      return "#b8e6b8" // 薄い緑 - 中企業
    case "small_corporation":
      return "#d4f1d4" // 非常に薄い緑 - 小企業
    case "financial_institution":
      return "#feca57" // 黄色 - 金融機関
    case "construction_company":
      return "#ff9ff3" // ピンク - 建設会社
    case "tech_company":
      return "#a8e6cf" // ミントグリーン - IT企業
    case "media_company":
      return "#dda0dd" // プラム - メディア企業
    case "labor_union":
      return "#87ceeb" // スカイブルー - 労働組合
    case "industry_association":
      return "#deb887" // バーリーウッド - 業界団体
    case "npo_organization":
      return "#f0e68c" // カーキ - NPO団体
    case "service_provider":
      return "#d3d3d3" // ライトグレー - サービス提供者
    case "government_agency":
      return "#9370db" // ミディアムパープル - 政府機関
    default:
      return "#808080" // グレー - 不明
  }
}

// ノードの形状を決定する関数を追加
const drawNodeShape = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, type: EntityType) => {
  ctx.save()

  switch (type) {
    case "politician_individual":
    case "politician_group":
      // 星形
      drawStar(ctx, x, y, radius, 5)
      break
    case "party_headquarters":
    case "party_branch":
      // 六角形
      drawPolygon(ctx, x, y, radius, 6)
      break
    case "large_corporation":
    case "medium_corporation":
    case "small_corporation":
      // 四角形
      drawSquare(ctx, x, y, radius)
      break
    case "financial_institution":
      // ダイヤモンド
      drawDiamond(ctx, x, y, radius)
      break
    case "tech_company":
      // 三角形
      drawTriangle(ctx, x, y, radius)
      break
    default:
      // 円形（デフォルト）
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      break
  }

  ctx.restore()
}

// 形状描画のヘルパー関数を追加
const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, points: number) => {
  const outerRadius = radius
  const innerRadius = radius * 0.5
  let rot = (Math.PI / 2) * 3
  const step = Math.PI / points

  ctx.beginPath()
  ctx.moveTo(x, y - outerRadius)

  for (let i = 0; i < points; i++) {
    const xOuter = x + Math.cos(rot) * outerRadius
    const yOuter = y + Math.sin(rot) * outerRadius
    ctx.lineTo(xOuter, yOuter)
    rot += step

    const xInner = x + Math.cos(rot) * innerRadius
    const yInner = y + Math.sin(rot) * innerRadius
    ctx.lineTo(xInner, yInner)
    rot += step
  }

  ctx.lineTo(x, y - outerRadius)
  ctx.closePath()
}

const drawPolygon = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, sides: number) => {
  const angle = (Math.PI * 2) / sides
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  for (let i = 1; i < sides; i++) {
    ctx.lineTo(x + radius * Math.cos(angle * i), y + radius * Math.sin(angle * i))
  }
  ctx.closePath()
}

const drawSquare = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
  const size = radius * 1.4
  ctx.beginPath()
  ctx.rect(x - size / 2, y - size / 2, size, size)
  ctx.closePath()
}

const drawDiamond = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
  ctx.beginPath()
  ctx.moveTo(x, y - radius)
  ctx.lineTo(x + radius, y)
  ctx.lineTo(x, y + radius)
  ctx.lineTo(x - radius, y)
  ctx.closePath()
}

const drawTriangle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
  const height = radius * 1.5
  ctx.beginPath()
  ctx.moveTo(x, y - height / 2)
  ctx.lineTo(x - radius, y + height / 2)
  ctx.lineTo(x + radius, y + height / 2)
  ctx.closePath()
}

export default function NetworkGraphView({ transactions, onNodeSelect }: NetworkGraphViewProps) {
  const cyRef = useRef<HTMLDivElement | null>(null)
  const cyInstanceRef = useRef<cytoscape.Core | null>(null)

  useEffect(() => {
    if (cyRef.current && transactions.length > 0) {
      const nodesMap = new Map<string, CytoscapeNodeData>()
      const edges: cytoscape.ElementDefinition[] = []

      transactions.forEach((tx) => {
        if (!nodesMap.has(tx.from)) {
          const type = getNodeType(tx.from)
          nodesMap.set(tx.from, { id: tx.from, label: tx.from, type })
        }
        if (!nodesMap.has(tx.to)) {
          const type = getNodeType(tx.to)
          nodesMap.set(tx.to, { id: tx.to, label: tx.to, type })
        }
        edges.push({
          data: {
            id: `edge-${tx.id}`,
            source: tx.from,
            target: tx.to,
            amount: tx.amount,
            label: `¥${tx.amount.toLocaleString()}`,
            description: tx.description,
            type: tx.type,
          },
        })
      })

      // useEffect内のcytoscapeElements作成部分を更新
      const cytoscapeElements: cytoscape.ElementDefinition[] = [
        ...Array.from(nodesMap.values()).map((node) => {
          const connectionCount = edges.filter(
            (edge) => edge.data.source === node.id || edge.data.target === node.id,
          ).length
          const sizeConfig = getNodeSize(node.type, connectionCount)

          return {
            data: {
              ...node,
              size: sizeConfig.radius,
              importance: sizeConfig.importance,
              connectionCount,
            },
          }
        }),
        ...edges,
      ]

      if (cyInstanceRef.current) {
        cyInstanceRef.current.destroy()
      }

      const cy = cytoscape({
        container: cyRef.current,
        elements: cytoscapeElements,
        style: [
          {
            selector: "node",
            style: {
              "background-color": (ele: cytoscape.NodeSingular) => getNodeColor(ele.data("type")),
              label: "data(label)",
              color: "#ffffff",
              "text-outline-color": (ele: cytoscape.NodeSingular) => getNodeColor(ele.data("type")),
              "text-outline-width": 2,
              "font-size": (ele: cytoscape.NodeSingular) => Math.max(8, ele.data("size") * 0.6) + "px",
              width: (ele: cytoscape.NodeSingular) => ele.data("size") * 2,
              height: (ele: cytoscape.NodeSingular) => ele.data("size") * 2,
              "text-valign": "center",
              "text-halign": "center",
              "transition-property": "opacity, background-color, border-color, border-width",
              "transition-duration": "0.2s",
              opacity: 1,
              "border-width": (ele: cytoscape.NodeSingular) => Math.max(2, ele.data("importance") * 0.3),
              "border-color": (ele: cytoscape.NodeSingular) => {
                const color = getNodeColor(ele.data("type"))
                // より明るい境界線色を生成
                return color.replace(
                  /rgb$$(\d+),(\d+),(\d+)$$/,
                  (match, r, g, b) =>
                    `rgb(${Math.min(255, Number.parseInt(r) + 40)},${Math.min(255, Number.parseInt(g) + 40)},${Math.min(255, Number.parseInt(b) + 40)})`,
                )
              },
              "z-index": (ele: cytoscape.NodeSingular) => ele.data("importance"),
            },
          },
          {
            selector: "edge",
            style: {
              width: 2,
              "line-color": (edge: cytoscape.EdgeSingular) => (edge.data("type") === "income" ? "#22c55e" : "#ef4444"),
              "target-arrow-color": (edge: cytoscape.EdgeSingular) =>
                edge.data("type") === "income" ? "#22c55e" : "#ef4444",
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
              label: "data(label)",
              "font-size": "8px",
              color: "#4b5563", // gray-600
              "text-background-opacity": 1,
              "text-background-color": "#ffffff",
              "text-background-padding": "2px",
              "text-rotation": "autorotate",
              "transition-property": "opacity, line-color, width",
              "transition-duration": "0.2s",
              opacity: 0.7,
            },
          },
          {
            selector: ".selected-node",
            style: {
              "border-width": 4,
              "border-color": "#FACC15", // yellow-400
              opacity: 1,
              "z-index": 10,
            },
          },
          {
            selector: ".highlighted-neighbor", // Neighbor nodes
            style: {
              opacity: 1,
              "border-width": 3,
              "border-color": "#93C5FD", // blue-300
              "z-index": 9,
            },
          },
          {
            selector: ".highlighted-edge", // Connected edges
            style: {
              "line-color": "#FDBA74", // orange-300
              "target-arrow-color": "#FDBA74",
              width: 3.5,
              opacity: 1,
              "z-index": 9,
            },
          },
          {
            selector: ".dimmed",
            style: {
              opacity: 0.15,
            },
          },
        ],
        layout: {
          name: "cose",
          idealEdgeLength: 120,
          nodeOverlap: 25,
          refresh: 20,
          fit: true,
          padding: 30,
          randomize: false,
          componentSpacing: 100,
          nodeRepulsion: 450000,
          edgeElasticity: 100,
          nestingFactor: 5,
          gravity: 80,
          numIter: 1000,
          initialTemp: 200,
          coolingFactor: 0.95,
          minTemp: 1.0,
        },
      })

      cy.on("tap", "node", (event) => {
        const selectedNodeElement = event.target

        cy.elements().removeClass("selected-node highlighted-neighbor highlighted-edge dimmed")

        selectedNodeElement.addClass("selected-node")
        const neighborhood = selectedNodeElement.neighborhood()
        neighborhood.nodes().addClass("highlighted-neighbor")
        neighborhood.edges().addClass("highlighted-edge")

        cy.elements().difference(selectedNodeElement.union(neighborhood)).addClass("dimmed")

        onNodeSelect(selectedNodeElement.data() as CytoscapeNodeData)
      })

      cy.on("tap", (event) => {
        if (event.target === cy) {
          // If background is tapped
          cy.elements().removeClass("selected-node highlighted-neighbor highlighted-edge dimmed")
          onNodeSelect(null)
        }
      })

      cyInstanceRef.current = cy

      return () => {
        cy.destroy()
        cyInstanceRef.current = null
      }
    }
  }, [transactions, onNodeSelect])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>資金ネットワークグラフ</CardTitle>
        <CardDescription>
          政治家、政党、企業間の資金の流れを視覚化します。ノードをクリックして関連をハイライトできます。
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100%-100px)] p-0">
        <div ref={cyRef} style={{ width: "100%", height: "100%" }} />
      </CardContent>
    </Card>
  )
}
