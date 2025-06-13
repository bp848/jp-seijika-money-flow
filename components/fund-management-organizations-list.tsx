"use client"

import { useEffect, useState } from "react"
import type { FundManagementOrganization } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDebounce } from "@/hooks/use-debounce" // Assuming you have this hook

export default function FundManagementOrganizationsList() {
  const [organizations, setOrganizations] = useState<FundManagementOrganization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(20) // Or make it configurable
  const [totalCount, setTotalCount] = useState(0)

  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [filters, setFilters] = useState({
    officeType: "",
    reportYear: "",
    jurisdiction: "",
    isActive: "", // 'true', 'false', or '' for all
  })

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        })
        if (debouncedSearchTerm) params.append("search", debouncedSearchTerm)
        if (filters.officeType) params.append("officeType", filters.officeType)
        if (filters.reportYear) params.append("reportYear", filters.reportYear)
        if (filters.jurisdiction) params.append("jurisdiction", filters.jurisdiction)
        if (filters.isActive) params.append("isActive", filters.isActive)

        const response = await fetch(`/api/fund-management-organizations?${params.toString()}`)
        if (!response.ok) {
          const errData = await response.json()
          throw new Error(errData.error || `HTTP error! status: ${response.status}`)
        }
        const { data, count } = await response.json()
        setOrganizations(data || [])
        setTotalCount(count || 0)
      } catch (e: any) {
        console.error("Failed to fetch organizations:", e)
        setError(e.message || "Failed to load data.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [page, limit, debouncedSearchTerm, filters])

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }))
    setPage(1) // Reset to first page on filter change
  }

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fund Management Organizations</CardTitle>
        <CardDescription>A list of political fund management organizations.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Input
            placeholder="Filter by Office Type..."
            value={filters.officeType}
            onChange={(e) => handleFilterChange("officeType", e.target.value)}
          />
          <Input
            placeholder="Filter by Report Year..."
            type="number"
            value={filters.reportYear}
            onChange={(e) => handleFilterChange("reportYear", e.target.value)}
          />
          <Input
            placeholder="Filter by Jurisdiction..."
            value={filters.jurisdiction}
            onChange={(e) => handleFilterChange("jurisdiction", e.target.value)}
          />
          <Select value={filters.isActive} onValueChange={(value) => handleFilterChange("isActive", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Active Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading && <p>Loading organizations...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && organizations.length === 0 && <p>No organizations found.</p>}

        {!loading && !error && organizations.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Organization Name</TableHead>
                    <TableHead>Politician</TableHead>
                    <TableHead>Office Type</TableHead>
                    <TableHead>Report Year</TableHead>
                    <TableHead>Jurisdiction</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>{org.id}</TableCell>
                      <TableCell className="font-medium">{org.organization_name}</TableCell>
                      <TableCell>{org.politicians?.name || "N/A"}</TableCell>
                      <TableCell>{org.office_type || "N/A"}</TableCell>
                      <TableCell>{org.report_year || "N/A"}</TableCell>
                      <TableCell>{org.jurisdiction || "N/A"}</TableCell>
                      <TableCell>
                        {org.is_active !== null ? (
                          <Badge variant={org.is_active ? "default" : "outline"}>
                            {org.is_active ? "Active" : "Inactive"}
                          </Badge>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>{new Date(org.updated_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                Page {page} of {totalPages} ({totalCount} items)
              </div>
              <div className="space-x-2">
                <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}>
                  Previous
                </Button>
                <Button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
