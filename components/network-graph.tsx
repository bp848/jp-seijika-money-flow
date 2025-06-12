"use client"

import { useMemo } from "react"
import ReactFlow, { Background, Controls, type Edge, type Node } from "reactflow"
import dagre from "dagre"
import "reactflow/dist/style.css"
import type { FundFlow } from "@/hooks/use-fund-flows"

interface NetworkGraphProps {
  flows: FundFlow[]
  visibleCount: number
}

interface LayoutCache {
  nodes: Node[]
  edges: Edge[]
}

const nodeWidth = 172
const nodeHeight = 36

const calculateLayout = (flows: FundFlow[]): LayoutCache => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: "LR", nodesep: 50, ranksep: 100 })

  const nodeMap = new Map<string, Node>()
  const edgeArray: Edge[] = []

  flows.forEach((flow) => {
    const sourceId = flow.source_entity_id
    const targetId = flow.target_entity_id
    const sourceName = flow.source_entity?.name || `Unknown-${sourceId.slice(0, 8)}`
    const targetName = flow.target_entity?.name || `Unknown-${targetId.slice(0, 8)}`

    if (!nodeMap.has(sourceId)) {
      nodeMap.set(sourceId, {
        id: sourceId,
        position: { x: 0, y: 0 },
        data: { label: sourceName },
        className: "source-node",
      })
    }

    if (!nodeMap.has(targetId)) {
      nodeMap.set(targetId, {
        id: targetId,
        position: { x: 0, y: 0 },
        data: { label: targetName },
        className: "target-node",
      })
    }

    const strokeWidth = Math.max(0.5, Math.log10(flow.amount / 1000))
    edgeArray.push({
      id: flow.id,
      source: sourceId,
      target: targetId,
      animated: false,
      style: { strokeWidth, stroke: "#6b7280" },
      label: `¥${flow.amount.toLocaleString()}`,
      className: "flow-edge",
    })
  })

  const nodes = Array.from(nodeMap.values())
  const edges = edgeArray

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    }
  })

  return { nodes, edges }
}

export default function NetworkGraph({ flows, visibleCount }: NetworkGraphProps) {
  const layoutCache = useMemo(() => calculateLayout(flows), [flows])

  const { visibleNodes, visibleEdges } = useMemo(() => {
    const visibleFlows = flows.slice(0, visibleCount)
    const visibleFlowIds = new Set(visibleFlows.map((f) => f.id))
    const visibleEntityIds = new Set<string>()

    visibleFlows.forEach((flow) => {
      visibleEntityIds.add(flow.source_entity_id)
      visibleEntityIds.add(flow.target_entity_id)
    })

    return {
      visibleNodes: layoutCache.nodes.filter((node) => visibleEntityIds.has(node.id)),
      visibleEdges: layoutCache.edges.filter((edge) => visibleFlowIds.has(edge.id)),
    }
  }, [layoutCache, flows, visibleCount])

  return (
    <div className="h-full w-full bg-gray-50">
      <style jsx global>{`
        .source-node {
          @apply border-2 border-red-500 bg-red-50 rounded-lg px-4 py-2 text-gray-900 text-xs font-medium;
        }
        .target-node {
          @apply border-2 border-green-500 bg-green-50 rounded-lg px-4 py-2 text-gray-900 text-xs font-medium;
        }
        .flow-edge .react-flow__edge-path {
          @apply stroke-gray-500;
        }
      `}</style>
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        fitView
        attributionPosition="bottom-left"
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  )
}
