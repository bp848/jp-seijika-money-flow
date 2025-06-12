"use client"

import { useState, useMemo, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/data-table"
import type { Column } from "@/components/data-table"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Interfaces now reflect the raw data structure from the API
interface Politician {
  id: string
  name: string
  party_id?: number // No party_name, but party_id is available
  branch_id?: string
  elected_area?: string
  position?: string
  total_income?: number | null
  total_expenditure?: number | null
  net_balance?: number | null
  profile_url?: string
  name_kana?: string
  photo_url?: string
}

interface Party {
  id: number // From your schema, id is an integer
  name: string
  representative_name?: string
  treasurer_name?: string
  total_income?: number | null
  total_expenditure?: number | null
  net_balance?: number | null
}

interface PartyBranch {
  id: string
  name: string
  parent_party_name?: string
  representative_name?: string
  total_income?: number | null
  total_expenditure?: number | null
  net_balance?: number | null
}

interface PoliticalFundGroup {
  id: string
  name: string
  representative_name?: string
  total_income?: number | null
  total_expenditure?: number | null
  net_balance?: number | null
}

const formatCurrency = (amount: number | null | undefined) => {
  if (amount == null) return "-"
  return `¥${Number(amount).toLocaleString()}`
}

export default function PoliticalDataPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  // State to hold the list of all political parties for lookup
  const [parties, setParties] = useState<Party[]>([])
  const [isLoadingParties, setIsLoadingParties] = useState(true)

  // Fetch all political parties on component mount
  useEffect(() => {
    const fetchParties = async () => {
      setIsLoadingParties(true)
      try {
        // Fetch all parties. Adjust API endpoint if it has pagination.
        const res = await fetch("/api/political-parties?limit=1000")
        const result = await res.json()
        if (result.success && Array.isArray(result.data)) {
          setParties(result.data)
        }
      } catch (error) {
        console.error("Failed to fetch political parties:", error)
      } finally {
        setIsLoadingParties(false)
      }
    }
    fetchParties()
  }, [])

  // Create a lookup map for party_id -> party_name
  const partyMap = useMemo(() => {
    return new Map(parties.map((party) => [party.id, party.name]))
  }, [parties])

  const politicianColumns = useMemo(
    (): Column<Politician>[] => [
      {
        key: "name",
        label: "氏名",
        href: (row) => `/explorer/politician/${row.id}`,
      },
      {
        key: "party_id", // Key is now party_id, which exists in the data
        label: "政党",
        href: (row) =>
          row.branch_id
            ? `/explorer/branch/${row.branch_id}`
            : row.party_id
              ? `/explorer/party/${row.party_id}`
              : undefined,
        render: (value, row) => {
          // 'value' is now row.party_id
          if (isLoadingParties) {
            return <Skeleton className="h-4 w-24" />
          }
          if (row.party_id === undefined) return "-"
          const partyName = partyMap.get(row.party_id)
          return partyName || "-"
        },
      },
      { key: "elected_area", label: "選挙区", render: (value) => value || "-" },
      {
        key: "total_income",
        label: "総収入",
        render: (value) => formatCurrency(value as number | null),
        href: (row) => `/explorer/politician/${row.id}?view=income`,
      },
      {
        key: "total_expenditure",
        label: "総支出",
        render: (value) => formatCurrency(value as number | null),
        href: (row) => `/explorer/politician/${row.id}?view=expenditure`,
      },
      {
        key: "net_balance",
        label: "差引残高",
        render: (value) => formatCurrency(value as number | null),
        href: (row) => `/explorer/politician/${row.id}?view=overview`,
      },
    ],
    [partyMap, isLoadingParties], // Dependency array includes the map and loading state
  )

  // Other column definitions remain largely the same, but ensure types are correct
  const partyColumns = useMemo(
    (): Column<Party>[] => [
      {
        key: "name",
        label: "党名",
        href: (row: Party) => `/explorer/party/${row.id}`,
      },
      { key: "representative_name", label: "代表者", render: (value) => value || "-" },
      {
        key: "total_income",
        label: "総収入",
        render: (value) => formatCurrency(value as number | null),
        href: (row: Party) => `/explorer/party/${row.id}?view=income`,
      },
      {
        key: "total_expenditure",
        label: "総支出",
        render: (value) => formatCurrency(value as number | null),
        href: (row: Party) => `/explorer/party/${row.id}?view=expenditure`,
      },
      {
        key: "net_balance",
        label: "差引残高",
        render: (value) => formatCurrency(value as number | null),
        href: (row: Party) => `/explorer/party/${row.id}?view=overview`,
      },
    ],
    [],
  )

  const partyBranchColumns = useMemo(
    (): Column<PartyBranch>[] => [
      {
        key: "name",
        label: "支部名",
        href: (row: PartyBranch) => `/explorer/branch/${row.id}`,
      },
      { key: "parent_party_name", label: "所属政党", render: (value) => value || "-" },
      { key: "representative_name", label: "代表者", render: (value) => value || "-" },
      {
        key: "total_income",
        label: "総収入",
        render: (value) => formatCurrency(value as number | null),
        href: (row: PartyBranch) => `/explorer/branch/${row.id}?view=income`,
      },
      {
        key: "total_expenditure",
        label: "総支出",
        render: (value) => formatCurrency(value as number | null),
        href: (row: PartyBranch) => `/explorer/branch/${row.id}?view=expenditure`,
      },
      {
        key: "net_balance",
        label: "差引残高",
        render: (value) => formatCurrency(value as number | null),
        href: (row: PartyBranch) => `/explorer/branch/${row.id}?view=overview`,
      },
    ],
    [],
  )

  const politicalFundGroupColumns = useMemo(
    (): Column<PoliticalFundGroup>[] => [
      {
        key: "name",
        label: "団体名",
        href: (row: PoliticalFundGroup) => `/explorer/fund-group/${row.id}`,
      },
      { key: "representative_name", label: "代表者", render: (value) => value || "-" },
      {
        key: "total_income",
        label: "総収入",
        render: (value) => formatCurrency(value as number | null),
        href: (row: PoliticalFundGroup) => `/explorer/fund-group/${row.id}?view=income`,
      },
      {
        key: "total_expenditure",
        label: "総支出",
        render: (value) => formatCurrency(value as number | null),
        href: (row: PoliticalFundGroup) => `/explorer/fund-group/${row.id}?view=expenditure`,
      },
      {
        key: "net_balance",
        label: "差引残高",
        render: (value) => formatCurrency(value as number | null),
        href: (row: PoliticalFundGroup) => `/explorer/fund-group/${row.id}?view=overview`,
      },
    ],
    [],
  )

  const handlePoliticianRowClick = (row: Politician) => {
    router.push(`/explorer/politician/${row.id}`)
  }

  const apiPaths = {
    politicians: "/api/politicians",
    parties: "/api/political-parties",
    partyBranches: "/api/party-branches",
    politicalFundGroups: "/api/political-funds",
  }

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-900 min-h-screen text-gray-100">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white">政治資金の探索</h1>
        <p className="text-gray-400 mt-1">政治家、政党、関連団体の資金の流れを探索します。</p>
      </header>

      <div className="mb-6 relative">
        <Input
          type="search"
          placeholder="名前、団体名などで検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
      </div>

      <Tabs defaultValue="politicians" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-gray-800 border-gray-700 p-1 rounded-lg">
          <TabsTrigger
            value="politicians"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-gray-300"
          >
            政治家
          </TabsTrigger>
          <TabsTrigger
            value="parties"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-gray-300"
          >
            政党
          </TabsTrigger>
          <TabsTrigger
            value="partyBranches"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-gray-300"
          >
            政党支部
          </TabsTrigger>
          <TabsTrigger
            value="politicalFundGroups"
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-gray-300"
          >
            政治資金団体
          </TabsTrigger>
        </TabsList>

        <TabsContent value="politicians" className="mt-4">
          <DataTable
            title="政治家一覧"
            apiPath={apiPaths.politicians}
            columns={politicianColumns}
            externalSearchTerm={searchTerm}
            onRowClick={handlePoliticianRowClick}
          />
        </TabsContent>
        <TabsContent value="parties" className="mt-4">
          <DataTable
            title="政党一覧"
            apiPath={apiPaths.parties}
            columns={partyColumns}
            externalSearchTerm={searchTerm}
          />
        </TabsContent>
        <TabsContent value="partyBranches" className="mt-4">
          <DataTable
            title="政党支部一覧"
            apiPath={apiPaths.partyBranches}
            columns={partyBranchColumns}
            externalSearchTerm={searchTerm}
          />
        </TabsContent>
        <TabsContent value="politicalFundGroups" className="mt-4">
          <DataTable
            title="政治資金団体一覧"
            apiPath={apiPaths.politicalFundGroups}
            columns={politicalFundGroupColumns}
            externalSearchTerm={searchTerm}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
