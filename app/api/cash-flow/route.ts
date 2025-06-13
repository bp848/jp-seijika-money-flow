import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import type { Transaction as PrismaTransaction, Organization } from "@prisma/client"
import type { DisplayTransaction } from "@/app/flow/components/columns"
import type { SankeyNode, SankeyLink } from "@/app/flow/components/flow-sankey-chart" // Ensure this type is correctly defined/imported

export const dynamic = "force-dynamic"

interface TransactionWithEntities extends PrismaTransaction {
  source_entity: Pick<Organization, "id" | "name"> | null
  target_entity: Pick<Organization, "id" | "name"> | null
}

// Helper function to add or get a node, ensuring unique graph IDs
const addOrGetNode = (
  nodesMap: Map<string, SankeyNode>,
  originalId: string, // Use string for originalId to accommodate composite keys or non-numeric IDs
  label: string,
  type: "income_source" | "total_income" | "expenditure_category" | "specific_expenditure" | "other",
  graphIdCounter: { id: number },
): SankeyNode => {
  if (nodesMap.has(originalId)) {
    return nodesMap.get(originalId)!
  }
  const newNode: SankeyNode = { id: graphIdCounter.id++, label, originalId, type } // Added type to SankeyNode
  nodesMap.set(originalId, newNode)
  return newNode
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fromDate = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined
    const toDate = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined

    const transactions = (await prisma.transaction.findMany({
      where: {
        occurred_on: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        source_entity: { select: { id: true, name: true } },
        target_entity: { select: { id: true, name: true } },
      },
      orderBy: {
        occurred_on: "desc",
      },
      // Removed take: 200 to process all relevant transactions for accurate sums
    })) as TransactionWithEntities[]

    let totalIncome = 0
    let totalExpenditure = 0
    const expenditureByCategory: Record<string, number> = {}
    const incomeBySource: Record<string, number> = {}

    // Process transactions for summary and Sankey data
    transactions.forEach((tx) => {
      const amount = tx.amount?.toNumber() ?? 0
      const category = tx.category || "不明なカテゴリ" // Assuming 'category' field exists for expenditures
      const sourceName = tx.source_entity?.name || "不明な収入源"

      // Simplified income/expenditure logic based on transaction_type
      // This needs to be robust based on your actual data.
      if (tx.transaction_type === "収入" || tx.transaction_type === "寄付受領") {
        totalIncome += amount
        incomeBySource[sourceName] = (incomeBySource[sourceName] || 0) + amount
      } else if (tx.transaction_type === "支出" || tx.transaction_type === "寄付実行") {
        totalExpenditure += amount
        expenditureByCategory[category] = (expenditureByCategory[category] || 0) + amount
      }
      // Handle other transaction types or refine logic as needed
    })

    const netCashFlow = totalIncome - totalExpenditure

    // Prepare Sankey data
    const sankeyNodesMap = new Map<string, SankeyNode>()
    const sankeyLinks: SankeyLink[] = []
    const graphIdCounter = { id: 0 }

    // 1. Total Income Node
    const totalIncomeNodeLabel = "総収入"
    const totalIncomeNode = addOrGetNode(
      sankeyNodesMap,
      totalIncomeNodeLabel,
      `${totalIncomeNodeLabel} (¥${(totalIncome / 10000).toLocaleString()}万)`,
      "total_income",
      graphIdCounter,
    )

    // 2. Links from Income Sources to Total Income (Optional, can make graph busy)
    // Object.entries(incomeBySource).forEach(([source, amount]) => {
    //   if (amount > 0) {
    //     const sourceNode = addOrGetNode(sankeyNodesMap, source, source, "income_source", graphIdCounter);
    //     sankeyLinks.push({
    //       source: sourceNode.id,
    //       target: totalIncomeNode.id,
    //       value: amount,
    //       label: `¥${(amount / 10000).toLocaleString()}万`
    //     });
    //   }
    // });

    // 3. Links from Total Income to Expenditure Categories
    Object.entries(expenditureByCategory).forEach(([category, amount]) => {
      if (amount > 0) {
        const categoryNode = addOrGetNode(
          sankeyNodesMap,
          category,
          `${category} (¥${(amount / 10000).toLocaleString()}万)`,
          "expenditure_category",
          graphIdCounter,
        )
        sankeyLinks.push({
          source: totalIncomeNode.id, // Source is Total Income
          target: categoryNode.id,
          value: amount,
          label: `¥${(amount / 10000).toLocaleString()}万`,
        })

        // (Optional) Further breakdown: Specific expenditures within this category
        // This requires more detailed transaction data (e.g., sub_category or description)
        // For example, find transactions for this category and create sub-nodes:
        // transactions.filter(tx => tx.category === category && (tx.transaction_type === "支出" || tx.transaction_type === "寄付実行"))
        //   .forEach(specificTx => {
        //     const specificExpenditureName = specificTx.description || `支出項目 ${specificTx.id}`;
        //     const specificExpenditureAmount = specificTx.amount?.toNumber() ?? 0;
        //     if (specificExpenditureAmount > 0) {
        //       const specificNode = addOrGetNode(sankeyNodesMap, `specific_${specificTx.id}`, specificExpenditureName, "specific_expenditure", graphIdCounter);
        //       sankeyLinks.push({
        //         source: categoryNode.id,
        //         target: specificNode.id,
        //         value: specificExpenditureAmount,
        //         label: `¥${(specificExpenditureAmount / 10000).toLocaleString()}万`
        //       });
        //     }
        //   });
      }
    })

    // If totalIncome is 0 but there are expenditures, Sankey might look odd.
    // Add Total Income node even if 0 for structure, if there are expenditures.
    if (totalIncome === 0 && totalExpenditure > 0 && !sankeyNodesMap.has(totalIncomeNodeLabel)) {
      addOrGetNode(
        sankeyNodesMap,
        totalIncomeNodeLabel,
        `${totalIncomeNodeLabel} (¥0万)`,
        "total_income",
        graphIdCounter,
      )
    }

    const displayTransactions: DisplayTransaction[] = transactions
      .map((t) => ({
        id: t.id,
        occurred_on: t.occurred_on,
        source_name: t.source_entity?.name ?? "不明",
        target_name: t.target_entity?.name ?? "不明",
        amount: t.amount?.toNumber() ?? 0,
        transaction_type: t.transaction_type,
        category: t.category, // Pass category to display transaction
        description: t.description,
      }))
      .slice(0, 50)

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpenditure,
        netCashFlow,
        transactionCount: transactions.length,
      },
      transactions: displayTransactions,
      sankeyData: {
        nodes: Array.from(sankeyNodesMap.values()),
        links: sankeyLinks,
      },
    })
  } catch (error) {
    console.error("Error fetching cash flow data:", error)
    return NextResponse.json(
      { error: "キャッシュフローデータの取得に失敗しました。", details: (error as Error).message },
      { status: 500 },
    )
  }
}
