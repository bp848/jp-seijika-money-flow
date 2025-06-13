import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

// Define more specific types if needed, or use Prisma's generated types
interface Entity {
  id: number
  name: string
  type: "politician" | "organization" | "company" | "individual" // Add more as needed
}

interface GraphNode {
  id: number // Unique ID for the graph node itself
  originalId: number // DB ID
  label: string
  type: Entity["type"]
}

interface GraphLink {
  source: number // Graph node ID
  target: number // Graph node ID
  value: number
  label: string
  type: "funding" | "service" // Example
}

async function getEntityDetails(entityId: number): Promise<Entity | null> {
  // This is a simplified version. You'd check across multiple tables or have a unified entity table.
  const entity: Entity | null = null

  const politician = await prisma.politician.findUnique({ where: { id: entityId } })
  if (politician) {
    return { id: politician.id, name: politician.name_jp || `Politician ${politician.id}`, type: "politician" }
  }

  const organization = await prisma.organization.findUnique({ where: { id: entityId } })
  if (organization) {
    return { id: organization.id, name: organization.name || `Organization ${organization.id}`, type: "organization" } // Assuming 'name' field
  }
  // Add checks for Company, Individual etc. if you have those models
  return null
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const entityIdParam = searchParams.get("entityId")

    if (!entityIdParam) {
      return NextResponse.json({ error: "entityIdが必要です" }, { status: 400 })
    }

    const entityId = Number.parseInt(entityIdParam, 10)
    if (isNaN(entityId)) {
      return NextResponse.json({ error: "無効なentityIdです" }, { status: 400 })
    }

    const centralEntityDetails = await getEntityDetails(entityId)
    if (!centralEntityDetails) {
      return NextResponse.json({ error: "指定されたエンティティが見つかりません" }, { status: 404 })
    }

    // Fetch transactions where the entity is either a source or a target
    const relatedTransactions = await prisma.transaction.findMany({
      where: {
        OR: [{ source_entity_id: entityId }, { target_entity_id: entityId }],
        amount: { gt: 0 }, // Consider only transactions with positive amounts for simplicity
      },
      include: {
        source_entity: { select: { id: true, name: true } }, // Assuming Organization model for entities
        target_entity: { select: { id: true, name: true } },
      },
      take: 50, // Limit to avoid overly complex graphs initially
      orderBy: { amount: "desc" },
    })

    const nodesMap = new Map<number, GraphNode>()
    let graphNodeIdCounter = 0

    const addNode = (dbEntityId: number, name: string, type: Entity["type"]): GraphNode => {
      if (nodesMap.has(dbEntityId)) {
        return nodesMap.get(dbEntityId)!
      }
      const newNode: GraphNode = { id: graphNodeIdCounter++, originalId: dbEntityId, label: name, type }
      nodesMap.set(dbEntityId, newNode)
      return newNode
    }

    // Add central entity first
    const centralGraphNode = addNode(centralEntityDetails.id, centralEntityDetails.name, centralEntityDetails.type)

    const links: GraphLink[] = []

    for (const tx of relatedTransactions) {
      if (tx.source_entity_id && tx.target_entity_id && tx.amount) {
        const sourceDbEntity =
          tx.source_entity_id === centralEntityDetails.id
            ? centralEntityDetails
            : await getEntityDetails(tx.source_entity_id)
        const targetDbEntity =
          tx.target_entity_id === centralEntityDetails.id
            ? centralEntityDetails
            : await getEntityDetails(tx.target_entity_id)

        if (sourceDbEntity && targetDbEntity) {
          const sourceNode = addNode(sourceDbEntity.id, sourceDbEntity.name, sourceDbEntity.type)
          const targetNode = addNode(targetDbEntity.id, targetDbEntity.name, targetDbEntity.type)
          const value = tx.amount.toNumber()

          // Ensure link is between distinct graph nodes, even if one is the central entity
          if (sourceNode.id !== targetNode.id) {
            links.push({
              source: sourceNode.id,
              target: targetNode.id,
              value: value,
              label: `¥${(value / 10000).toLocaleString()}万 (${tx.transaction_type || "資金移動"})`,
              type: "funding", // Default type
            })
          }
        }
      }
    }

    return NextResponse.json({
      nodes: Array.from(nodesMap.values()),
      links,
      centralEntity: centralGraphNode,
    })
  } catch (error) {
    console.error("Error fetching relationship data:", error)
    return NextResponse.json(
      { error: "関連データの取得に失敗しました。", details: (error as Error).message },
      { status: 500 },
    )
  }
}
