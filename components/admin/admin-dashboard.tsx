"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Activity,
  Users,
  MessageSquare,
  Database,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  MemoryStick,
  HardDrive,
} from "lucide-react"

interface Stats {
  aiResponses: number
  apiCalls: number
  activeUsers: number
  dataProcessed: string
  change: {
    aiResponses: string
    apiCalls: string
    activeUsers: string
    dataProcessed: string
  }
}

interface ApiKey {
  name: string
  status: "active" | "inactive"
  lastUsed: string
}

interface HealthMetric {
  component: string
  value: string
  status: "normal" | "warning" | "critical"
  icon: string
}

interface ActivityLog {
  time: string
  action: string
  type: "info" | "success" | "warning" | "error"
}

interface LangChainConfig {
  model: string
  temperature: number
  maxTokens: number
  lastUpdate: string
  status: string
}

// アイコンマッピング
const iconMap = {
  Cpu,
  MemoryStick,
  HardDrive,
  Clock,
  Activity,
  Users,
  MessageSquare,
  Database,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [health, setHealth] = useState<HealthMetric[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [langchainConfig, setLangchainConfig] = useState<LangChainConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [statsRes, keysRes, healthRes, activitiesRes, configRes] = await Promise.all([
        fetch("/api/admin/stats").catch(() => null),
        fetch("/api/admin/api-keys").catch(() => null),
        fetch("/api/admin/health").catch(() => null),
        fetch("/api/admin/activities").catch(() => null),
        fetch("/api/admin/langchain-config").catch(() => null),
      ])

      // 統計情報
      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json()
        if (statsData.success) {
          setStats(statsData.stats)
        }
      }

      // APIキー情報
      if (keysRes && keysRes.ok) {
        const keysData = await keysRes.json()
        if (keysData.success) {
          setApiKeys(keysData.keys)
        }
      }

      // ヘルス情報
      if (healthRes && healthRes.ok) {
        const healthData = await healthRes.json()
        if (healthData.success) {
          setHealth(healthData.health)
        }
      }

      // アクティビティ情報
      if (activitiesRes && activitiesRes.ok) {
        const activitiesData = await activitiesRes.json()
        if (activitiesData.success) {
          setActivities(activitiesData.activities)
        }
      }

      // LangChain設定
      if (configRes && configRes.ok) {
        const configData = await configRes.json()
        if (configData.success) {
          setLangchainConfig(configData.config)
        }
      }
    } catch (err) {
      console.error("データ取得エラー:", err)
      setError("データの取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (change: string) => {
    if (change.startsWith("+")) return TrendingUp
    if (change.startsWith("-")) return TrendingDown
    return Minus
  }

  const getTrendColor = (change: string) => {
    if (change.startsWith("+")) return "text-green-600"
    if (change.startsWith("-")) return "text-red-600"
    return "text-gray-600"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "normal":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            正常
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            警告
          </Badge>
        )
      case "critical":
      case "inactive":
        return <Badge variant="destructive">エラー</Badge>
      default:
        return <Badge variant="outline">不明</Badge>
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-blue-600" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI応答数</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.aiResponses?.toLocaleString() || 0}</div>
            {stats?.change?.aiResponses && (
              <p className={`text-xs ${getTrendColor(stats.change.aiResponses)} flex items-center`}>
                {(() => {
                  const Icon = getTrendIcon(stats.change.aiResponses)
                  return <Icon className="h-3 w-3 mr-1" />
                })()}
                {stats.change.aiResponses} 前月比
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API呼び出し</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.apiCalls?.toLocaleString() || 0}</div>
            {stats?.change?.apiCalls && (
              <p className={`text-xs ${getTrendColor(stats.change.apiCalls)} flex items-center`}>
                {(() => {
                  const Icon = getTrendIcon(stats.change.apiCalls)
                  return <Icon className="h-3 w-3 mr-1" />
                })()}
                {stats.change.apiCalls} 前月比
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブユーザー</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers?.toLocaleString() || 0}</div>
            {stats?.change?.activeUsers && (
              <p className={`text-xs ${getTrendColor(stats.change.activeUsers)} flex items-center`}>
                {(() => {
                  const Icon = getTrendIcon(stats.change.activeUsers)
                  return <Icon className="h-3 w-3 mr-1" />
                })()}
                {stats.change.activeUsers} 前月比
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">処理済みデータ</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.dataProcessed || "0MB"}</div>
            {stats?.change?.dataProcessed && (
              <p className={`text-xs ${getTrendColor(stats.change.dataProcessed)} flex items-center`}>
                {(() => {
                  const Icon = getTrendIcon(stats.change.dataProcessed)
                  return <Icon className="h-3 w-3 mr-1" />
                })()}
                {stats.change.dataProcessed} 前月比
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* APIキー状態 */}
        <Card>
          <CardHeader>
            <CardTitle>APIキー状態</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiKeys.length > 0 ? (
                apiKeys.map((key, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{key.name}</p>
                      <p className="text-sm text-muted-foreground">最終使用: {key.lastUsed}</p>
                    </div>
                    {getStatusBadge(key.status)}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">APIキー情報を取得中...</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* システムヘルス */}
        <Card>
          <CardHeader>
            <CardTitle>システムヘルス</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {health.length > 0 ? (
                health.map((metric, index) => {
                  const IconComponent = iconMap[metric.icon as keyof typeof iconMap] || Activity
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-4 w-4" />
                        <span className="font-medium">{metric.component}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{metric.value}</span>
                        {getStatusBadge(metric.status)}
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground">システムヘルス情報を取得中...</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 最近のアクティビティ */}
        <Card>
          <CardHeader>
            <CardTitle>最近のアクティビティ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">アクティビティ情報を取得中...</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* LangChain設定 */}
        <Card>
          <CardHeader>
            <CardTitle>LangChain設定</CardTitle>
          </CardHeader>
          <CardContent>
            {langchainConfig ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">モデル:</span>
                  <span className="text-sm">{langchainConfig.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Temperature:</span>
                  <span className="text-sm">{langchainConfig.temperature}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Max Tokens:</span>
                  <span className="text-sm">{langchainConfig.maxTokens}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">ステータス:</span>
                  {getStatusBadge("normal")}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">最終更新:</span>
                  <span className="text-sm">{new Date(langchainConfig.lastUpdate).toLocaleString("ja-JP")}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">設定情報を取得中...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
