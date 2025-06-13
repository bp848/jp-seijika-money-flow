"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import ForceGraph2D, { type NodeObject, type LinkObject, type ForceGraphMethods } from "react-force-graph-2d"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CustomNode extends NodeObject {
  id: string // react-force-graph expects string or number id
  originalId: number
  label: string
  type: "politician" | "organization" | "company" | "individual" | "unknown"
  val?: number // Optional: for node size based on centrality or total funds
  color?: string
}

interface CustomLink extends LinkObject {
  source: string | number | CustomNode // react-force-graph expects string or number id for source/target
  target: string | number | CustomNode
  value: number //资金量 for link thickness/color
  label: string // e.g., "¥100万 (寄付)"
  type: "funding" | "service" | "unknown"
  color?: string
}

export interface RelationshipGraphData {
  nodes: CustomNode[]
  links: CustomLink[]
}

interface RelationshipGraphProps {
  data: RelationshipGraphData | null
  isLoading: boolean
  height?: number
  width?: number
  onNodeClick?: (node: CustomNode) => void
  onLinkClick?: (link: CustomLink) => void
  centralNodeId?: string | number
}

const NODE_COLORS = {
  politician: "rgba(239, 68, 68, 0.9)", // red-500
  organization: "rgba(59, 130, 246, 0.9)", // blue-500
  company: "rgba(245, 158, 11, 0.9)", // amber-500
  individual: "rgba(34, 197, 94, 0.9)", // green-500
  unknown: "rgba(107, 114, 128, 0.9)", // gray-500
}

const LINK_COLOR = "rgba(156, 163, 175, 0.5)" // gray-400
const HIGHLIGHT_LINK_COLOR = "rgba(236, 72, 153, 0.8)" // pink-500
const CENTRAL_NODE_COLOR = "rgba(168, 85, 247, 0.9)" // purple-500

export function RelationshipGraph({
  data,
  isLoading,
  height = 600,
  width, // If not provided, will try to fit container
  onNodeClick,
  onLinkClick,
  centralNodeId,
}: RelationshipGraphProps) {
  const graphRef = useRef<ForceGraphMethods>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [graphDimensions, setGraphDimensions] = useState({ width: 0, height: 0 })
  const [hoverNode, setHoverNode] = useState<CustomNode | null>(null)
  const [hoverLink, setHoverLink] = useState<CustomLink | null>(null)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setGraphDimensions({
          width: width || containerRef.current.offsetWidth,
          height: height || containerRef.current.offsetHeight || 600,
        })
      }
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [width, height])

  useEffect(() => {
    if (data && data.nodes.length > 0 && graphRef.current) {
      graphRef.current.d3ReheatSimulation() // Reheat simulation when data changes
      if (centralNodeId) {
        const centralNode = data.nodes.find((n) => n.id === centralNodeId)
        if (centralNode) {
          graphRef.current.centerAt(centralNode.x, centralNode.y, 1000)
          graphRef.current.zoom(1.5, 1000)
        }
      }
    }
  }, [data, centralNodeId])

  const nodeCanvasObject = useCallback(
    (node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const n = node as CustomNode
      const label = n.label
      const fontSize = 12 / globalScale
      const nodeSize = Math.max(3, Math.min(15, (n.val || 5) / globalScale)) // Adjust val for node size

      ctx.beginPath()
      ctx.arc(n.x!, n.y!, nodeSize, 0, 2 * Math.PI, false)
      ctx.fillStyle =
        n.id === centralNodeId ? CENTRAL_NODE_COLOR : n.color || NODE_COLORS[n.type] || NODE_COLORS.unknown
      ctx.fill()

      // Highlight border if hovered
      if (hoverNode && hoverNode.id === n.id) {
        ctx.strokeStyle = "rgba(255,255,0,1)" // Yellow highlight
        ctx.lineWidth = 2 / globalScale
        ctx.stroke()
      }

      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.font = `${fontSize}px Sans-Serif`
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)" // Node label color (adjust for theme)

      // Simple text shadow for better readability on varied backgrounds
      ctx.shadowColor = "rgba(0,0,0,0.7)"
      ctx.shadowBlur = 2
      ctx.shadowOffsetX = 1 / globalScale
      ctx.shadowOffsetY = 1 / globalScale

      ctx.fillText(label, n.x!, n.y! + nodeSize + fontSize * 0.8)

      // Reset shadow for other drawings
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    },
    [hoverNode, centralNodeId],
  )

  const linkCanvasObject = useCallback(
    (link: LinkObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const l = link as CustomLink
      const start = l.source as CustomNode // Assuming source/target are node objects after graph processing
      const end = l.target as CustomNode

      if (typeof start !== "object" || typeof end !== "object" || !start.x || !start.y || !end.x || !end.y) return

      // Calculate control points for curved lines (optional)
      const controlPoints = [
        (start.x + end.x) / 2 + (start.y - end.y) * 0.1,
        (start.y + end.y) / 2 + (end.x - start.x) * 0.1,
      ]

      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      // ctx.lineTo(end.x, end.y); // Straight line
      ctx.quadraticCurveTo(controlPoints[0], controlPoints[1], end.x, end.y) // Curved line

      const maxStrokeWidth = 8 / globalScale
      const minStrokeWidth = 0.5 / globalScale
      // Normalize link value for stroke width (example: 0 to 100M)
      // This normalization needs to be adjusted based on your typical data range
      const normalizedValue = Math.log1p(l.value) / Math.log1p(100000000) // Log scale for better visual diff
      ctx.lineWidth = Math.max(minStrokeWidth, Math.min(maxStrokeWidth, normalizedValue * maxStrokeWidth))

      ctx.strokeStyle =
        (hoverLink && hoverLink.source === l.source && hoverLink.target === l.target) ||
        (hoverNode && (hoverNode.id === (l.source as CustomNode).id || hoverNode.id === (l.target as CustomNode).id))
          ? HIGHLIGHT_LINK_COLOR
          : l.color || LINK_COLOR
      ctx.stroke()

      // Arrowhead (optional)
      const arrowLength = 6 / globalScale
      const arrowAngle = Math.PI / 7
      const angle = Math.atan2(end.y - start.y, end.x - start.x)
      ctx.beginPath()
      ctx.moveTo(end.x, end.y)
      ctx.lineTo(end.x - arrowLength * Math.cos(angle - arrowAngle), end.y - arrowLength * Math.sin(angle - arrowAngle))
      ctx.lineTo(end.x - arrowLength * Math.cos(angle + arrowAngle), end.y - arrowLength * Math.sin(angle + arrowAngle))
      ctx.closePath()
      ctx.fillStyle = ctx.strokeStyle
      ctx.fill()
    },
    [hoverNode, hoverLink],
  )

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <Skeleton style={{ height: `${height}px`, width: "100%" }} />
        </CardContent>
      </Card>
    )
  }

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex items-center justify-center" style={{ height: `${height}px` }}>
          <p className="text-muted-foreground">表示する関連データがありません。</p>
        </CardContent>
      </Card>
    )
  }

  const handleNodeHover = (node: NodeObject | null) => {
    setHoverNode(node as CustomNode | null)
  }

  const handleLinkHover = (link: LinkObject | null) => {
    setHoverLink(link as CustomLink | null)
  }

  return (
    <TooltipProvider>
      <div ref={containerRef} className="w-full h-full relative">
        {graphDimensions.width > 0 && (
          <ForceGraph2D
            ref={graphRef}
            graphData={data}
            width={graphDimensions.width}
            height={graphDimensions.height}
            nodeId="id"
            nodeLabel="label" // Tooltip label
            nodeRelSize={6} // Base node size
            // nodeVal={node => (node as CustomNode).val || 1} // Node size by value
            nodeColor={(node) =>
              (node as CustomNode).id === centralNodeId
                ? CENTRAL_NODE_COLOR
                : NODE_COLORS[(node as CustomNode).type] || NODE_COLORS.unknown
            }
            nodeCanvasObjectMode={() => "after"} // Draw custom objects after default node
            nodeCanvasObject={nodeCanvasObject}
            linkSource="source"
            linkTarget="target"
            // linkLabel="label" // Tooltip label for links
            // linkWidth={link => Math.max(0.1, Math.min(5, Math.log1p((link as CustomLink).value) / 10))} //资金量
            linkColor={() => LINK_COLOR}
            linkCanvasObjectMode={() => "after"}
            linkCanvasObject={linkCanvasObject}
            linkDirectionalArrowLength={3.5}
            linkDirectionalArrowRelPos={1}
            cooldownTicks={100}
            onEngineStop={() => graphRef.current?.zoomToFit(400, 100)}
            onNodeHover={handleNodeHover}
            onNodeClick={(node, event) => {
              if (onNodeClick) onNodeClick(node as CustomNode)
              // Optional: center on clicked node
              // graphRef.current?.centerAt(node.x, node.y, 1000);
              // graphRef.current?.zoom(2, 1000);
            }}
            onLinkHover={handleLinkHover}
            onLinkClick={(link, event) => {
              if (onLinkClick) onLinkClick(link as CustomLink)
            }}
            // Enable dragging and zooming
            enableZoomInteraction={true}
            enablePanInteraction={true}
            enableNodeDrag={true}
          />
        )}
        {hoverNode && (
          <Tooltip open={!!hoverNode}>
            <TooltipTrigger asChild>
              {/* This is a virtual trigger, actual position is handled by ForceGraph's mouse events */}
              <div style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }} />
            </TooltipTrigger>
            <TooltipContent
              className="bg-background border shadow-lg p-2 rounded-md"
              // Position tooltip near mouse - this is tricky with canvas, usually handled by graph lib or custom logic
            >
              <p className="font-bold">{hoverNode.label}</p>
              <p className="text-sm">
                タイプ: <Badge variant="outline">{hoverNode.type}</Badge>
              </p>
              {hoverNode.val && <p className="text-sm">関連資金総額: ¥{hoverNode.val.toLocaleString()}</p>}
              <p className="text-xs text-muted-foreground">ID: {hoverNode.originalId}</p>
            </TooltipContent>
          </Tooltip>
        )}
        {hoverLink && (
          <Tooltip open={!!hoverLink}>
            <TooltipTrigger asChild>
              <div style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }} />
            </TooltipTrigger>
            <TooltipContent className="bg-background border shadow-lg p-2 rounded-md">
              <p className="font-bold">
                {(hoverLink.source as CustomNode)?.label} → {(hoverLink.target as CustomNode)?.label}
              </p>
              <p className="text-sm">金額: {hoverLink.label}</p>
              <p className="text-sm">
                タイプ: <Badge variant="outline">{hoverLink.type}</Badge>
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
