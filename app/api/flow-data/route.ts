import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import type { Transaction } from "@prisma/client"

export const dynamic = "force-dynamic" // Ensure fresh data on each request

interface SankeyNode {
  id: number
  label: string
  originalId: number // Store original entity ID
}

interface SankeyLink {
  source: number
  target: number
  value: number
  label: string
}

interface FlowDataResponse {
  summary: {
    totalTransactions: number
    totalOrganizations: number // Or entities involved
    totalRevenue: number
  }
  transactions: Partial<Transaction & { source_name: string | null; target_name: string | null }>[]
  sankeyNodes: SankeyNode[]
  sankeyLinks: SankeyLink[]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const minAmountParam = searchParams.get("minAmount")
    const minAmount = minAmountParam ? Number.parseInt(minAmountParam, 10) * 10000 : 0 // Convert 万 JPY to JPY
    const limitTransactions = 100 // Limit for Sankey diagram

    const rawTransactions = await prisma.transaction.findMany({
      include: {
        source_entity: { select: { id: true, name: true } },
        target_entity: { select: { id: true, name: true } },
      },
      orderBy: {
        amount: "desc", // For potentially filtering top N by amount later
      },
      // We fetch more initially to calculate total revenue correctly, then filter for Sankey
    })

    const totalTransactions = rawTransactions.length

    // Assuming 'income' is represented by positive amounts or a specific transaction_type.
    // For simplicity, let's assume positive amounts are revenue.
    // In a real scenario, transaction_type might be '寄付', '収入' etc.
    const totalRevenue = rawTransactions
      .filter((t) => t.amount && t.amount.toNumber() > 0)
      .reduce((sum, t) => sum + (t.amount ? t.amount.toNumber() : 0), 0)

    const involvedEntityIds = new Set<number>()
    rawTransactions.forEach((t) => {
      if (t.source_entity_id) involvedEntityIds.add(t.source_entity_id)
      if (t.target_entity_id) involvedEntityIds.add(t.target_entity_id)
    })
    const totalOrganizations = involvedEntityIds.size

    // Prepare transactions for table display (top 20 by date for example)
    const displayTransactions = rawTransactions
      .sort((a, b) => (b.occurred_on?.getTime() ?? 0) - (a.occurred_on?.getTime() ?? 0))
      .slice(0, 20)
      .map((t) => ({
        id: t.id,
        occurred_on: t.occurred_on,
        source_name: t.source_entity?.name ?? "不明",
        target_name: t.target_entity?.name ?? "不明",
        amount: t.amount?.toNumber() ?? 0,
        transaction_type: t.transaction_type,
        // description: t.description, // if you have this field
      }))

    // Filter and limit transactions for Sankey diagram
    const sankeyFilteredTransactions = rawTransactions
      .filter((t) => t.amount && t.amount.toNumber() >= minAmount && t.source_entity_id && t.target_entity_id)
      .sort((a, b) => (b.amount?.toNumber() ?? 0) - (a.amount?.toNumber() ?? 0))
      .slice(0, limitTransactions)

    const nodesMap = new Map<number, SankeyNode>()
    let nodeCounter = 0

    sankeyFilteredTransactions.forEach((tx) => {
      if (tx.source_entity_id && !nodesMap.has(tx.source_entity_id)) {
        nodesMap.set(tx.source_entity_id, {
          id: nodeCounter++,
          label: tx.source_entity?.name ?? `ID: ${tx.source_entity_id}`,
          originalId: tx.source_entity_id,
        })
      }
      if (tx.target_entity_id && !nodesMap.has(tx.target_entity_id)) {
        nodesMap.set(tx.target_entity_id, {
          id: nodeCounter++,
          label: tx.target_entity?.name ?? `ID: ${tx.target_entity_id}`,
          originalId: tx.target_entity_id,
        })
      }
    })

    const sankeyNodes = Array.from(nodesMap.values())
    const sankeyLinks: SankeyLink[] = sankeyFilteredTransactions
      .map((tx) => {
        const sourceNode = tx.source_entity_id ? nodesMap.get(tx.source_entity_id) : undefined
        const targetNode = tx.target_entity_id ? nodesMap.get(tx.target_entity_id) : undefined
        const value = tx.amount ? tx.amount.toNumber() : 0

        if (sourceNode && targetNode && value > 0) {
          return {
            source: sourceNode.id,
            target: targetNode.id,
            value: value,
            label: `${(value / 10000).toLocaleString()}万円`,
          }
        }
        return null
      })
      .filter((link) => link !== null) as SankeyLink[]

    const responseData: FlowDataResponse = {
      summary: {
        totalTransactions,
        totalOrganizations,
        totalRevenue,
      },
      transactions: displayTransactions,
      sankeyNodes,
      sankeyLinks,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching flow data:", error)
    return NextResponse.json(
      { error: "データの取得に失敗しました。", details: (error as Error).message },
      { status: 500 },
    )
  }
}
