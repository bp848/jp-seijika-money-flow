"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface HealthStatus {
  status: "healthy" | "error" | "unknown"
  message: string
  timestamp: string
}

interface HealthCheckResult {
  database: HealthStatus
  groq: HealthStatus
  environment: HealthStatus
}

interface SystemLog {
  id: string
  level: "info" | "warning" | "error"
  message: string
  component: string
  metadata: Record<string, any>
  created_at: string
}

export default function SystemHealthMonitor() {
  const [healthStatus, setHealthStatus] = useState<HealthCheckResult | null>(null)
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [loading, setLoading] = useState(false)
  const [logLevel, setLogLevel] = useState<string>("all")
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchHealthStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/health-check")
      const data = await response.json()
      setHealthStatus(data)
    } catch (error) {
      console.error("Failed to fetch health status:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({
        level: logLevel,
        limit: "50",
      })
      const response = await fetch(`/api/admin/system-logs?${params}`)
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error("Failed to fetch logs:", error)
    }
  }

  useEffect(() => {
    fetchHealthStatus()
    fetchLogs()
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [logLevel])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchHealthStatus()
        fetchLogs()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variant = status === "healthy" ? "default" : status === "error" ? "destructive" : "secondary"
    return <Badge variant={variant}>{status}</Badge>
  }

  const getLevelBadge = (level: string) => {
    const variant = level === "error" ? "destructive" : level === "warning" ? "secondary" : "outline"
    return <Badge variant={variant}>{level}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Health Monitor</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
            {autoRefresh ? "Stop Auto Refresh" : "Start Auto Refresh"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchHealthStatus()
              fetchLogs()
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health">Health Status</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          {healthStatus && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Database</CardTitle>
                  {getStatusIcon(healthStatus.database.status)}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getStatusBadge(healthStatus.database.status)}
                    <p className="text-xs text-muted-foreground">{healthStatus.database.message}</p>
                    <p className="text-xs text-muted-foreground">
                      Last checked: {new Date(healthStatus.database.timestamp).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Groq API</CardTitle>
                  {getStatusIcon(healthStatus.groq.status)}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getStatusBadge(healthStatus.groq.status)}
                    <p className="text-xs text-muted-foreground">{healthStatus.groq.message}</p>
                    <p className="text-xs text-muted-foreground">
                      Last checked: {new Date(healthStatus.groq.timestamp).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Environment</CardTitle>
                  {getStatusIcon(healthStatus.environment.status)}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getStatusBadge(healthStatus.environment.status)}
                    <p className="text-xs text-muted-foreground">{healthStatus.environment.message}</p>
                    <p className="text-xs text-muted-foreground">
                      Last checked: {new Date(healthStatus.environment.timestamp).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={logLevel} onValueChange={setLogLevel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent System Logs</CardTitle>
              <CardDescription>Latest system events and errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {getLevelBadge(log.level)}
                        <span className="text-sm font-medium">{log.component}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{log.message}</p>
                      {Object.keys(log.metadata || {}).length > 0 && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground">View metadata</summary>
                          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
                {logs.length === 0 && <p className="text-center text-muted-foreground py-4">No logs found</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
