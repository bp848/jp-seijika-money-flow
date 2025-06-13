"use client"

import { Suspense } from "react"
import Plot from "react-plotly.js"
import type { Data } from "plotly.js"
import { Skeleton } from "@/components/ui/skeleton"

interface SankeyNode {
  id: number
  label: string
  originalId: number
}

interface SankeyLink {
  source: number
  target: number
  value: number
  label: string
}

interface FlowSankeyChartProps {
  nodes: SankeyNode[]
  links: SankeyLink[]
  title?: string
}

export function FlowSankeyChart({ nodes, links, title = "資金の流れ" }: FlowSankeyChartProps) {
  if (!nodes || !links || nodes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        ネットワーク図を表示するデータがありません。フィルタ条件を確認してください。
      </div>
    )
  }

  const data: Data[] = [
    {
      type: "sankey",
      orientation: "h",
      node: {
        pad: 15,
        thickness: 20,
        line: { color: "black", width: 0.5 },
        label: nodes.map((n) => n.label),
        customdata: nodes.map((n) => n.originalId), // For hover or click interactions
        hovertemplate: "団体名: %{label}<br>ID: %{customdata}<extra></extra>",
      },
      link: {
        source: links.map((l) => l.source),
        target: links.map((l) => l.target),
        value: links.map((l) => l.value),
        label: links.map((l) => l.label),
        hovertemplate: "%{source.label} → %{target.label}<br>金額: %{value:,.0f}円<extra></extra>",
      },
    },
  ]

  const layout = {
    title: title,
    font: { size: 10 },
    height: 800, // Adjust as needed
    // autosize: true, // Use autosize for responsiveness
  }

  return (
    <Suspense fallback={<Skeleton className="w-full h-[800px]" />}>
      <Plot
        data={data}
        layout={layout}
        style={{ width: "100%", height: "100%" }}
        useResizeHandler={true}
        config={{ responsive: true }}
      />
    </Suspense>
  )
}
