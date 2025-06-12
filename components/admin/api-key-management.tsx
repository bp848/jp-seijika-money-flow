"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Key,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  Shield,
} from "lucide-react"

interface ApiKey {
  id: string
  name: string
  service: string
  key: string
  status: "active" | "inactive" | "expired"
  lastUsed: string
  createdAt: string
  expiresAt?: string
  description: string
  usageCount: number
  rateLimit: string
}

export default function ApiKeyManagement() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "OpenAI Production",
      service: "openai",
      key: "sk-proj-abc123...xyz789",
      status: "active",
      lastUsed: "2分前",
      createdAt: "2024-11-01",
      description: "本番環境用のOpenAI APIキー",
      usageCount: 1247,
      rateLimit: "10,000 req/min",
    },
    {
      id: "2",
      name: "Groq API",
      service: "groq",
      key: "gsk_abc123...xyz789",
      status: "active",
      lastUsed: "5分前",
      createdAt: "2024-11-15",
      description: "高速推論用のGroq APIキー",
      usageCount: 892,
      rateLimit: "5,000 req/min",
    },
    {
      id: "3",
      name: "Supabase Database",
      service: "supabase",
      key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      status: "active",
      lastUsed: "1時間前",
      createdAt: "2024-10-20",
      description: "データベースアクセス用",
      usageCount: 2341,
      rateLimit: "無制限",
    },
    {
      id: "4",
      name: "Vercel Blob Storage",
      service: "vercel",
      key: "vercel_blob_rw_abc123...xyz789",
      status: "active",
      lastUsed: "30分前",
      createdAt: "2024-10-25",
      description: "ファイルストレージ用",
      usageCount: 156,
      rateLimit: "1,000 req/min",
    },
  ])

  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null)

  const [newKey, setNewKey] = useState({
    name: "",
    service: "",
    key: "",
    description: "",
    expiresAt: "",
  })

  const serviceOptions = [
    { value: "openai", label: "OpenAI", icon: "🤖" },
    { value: "groq", label: "Groq", icon: "⚡" },
    { value: "supabase", label: "Supabase", icon: "🗄️" },
    { value: "vercel", label: "Vercel", icon: "▲" },
    { value: "anthropic", label: "Anthropic", icon: "🧠" },
    { value: "custom", label: "カスタム", icon: "🔧" },
  ]

  const getServiceIcon = (service: string) => {
    const serviceOption = serviceOptions.find((s) => s.value === service)
    return serviceOption?.icon || "🔑"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            有効
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            <Clock className="h-3 w-3 mr-1" />
            無効
          </Badge>
        )
      case "expired":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            期限切れ
          </Badge>
        )
      default:
        return null
    }
  }

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Show toast notification here
  }

  const maskKey = (key: string) => {
    if (key.length <= 8) return key
    return key.substring(0, 8) + "..." + key.substring(key.length - 8)
  }

  const handleAddKey = () => {
    const id = Date.now().toString()
    const newApiKey: ApiKey = {
      id,
      name: newKey.name,
      service: newKey.service,
      key: newKey.key,
      status: "active",
      lastUsed: "未使用",
      createdAt: new Date().toISOString().split("T")[0],
      expiresAt: newKey.expiresAt || undefined,
      description: newKey.description,
      usageCount: 0,
      rateLimit: "設定中",
    }

    setApiKeys([...apiKeys, newApiKey])
    setNewKey({ name: "", service: "", key: "", description: "", expiresAt: "" })
    setIsAddDialogOpen(false)
  }

  const handleDeleteKey = (keyId: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== keyId))
  }

  const handleEditKey = (key: ApiKey) => {
    setEditingKey(key)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            APIキー管理
          </h1>
          <p className="text-gray-400 mt-2">外部サービス連携用のAPIキーを安全に管理</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500">
              <Plus className="h-4 w-4 mr-2" />
              新しいAPIキーを追加
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#161926] border-gray-800 max-w-md">
            <DialogHeader>
              <DialogTitle>新しいAPIキーを追加</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>キー名</Label>
                <Input
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                  placeholder="例: OpenAI Production"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label>サービス</Label>
                <Select value={newKey.service} onValueChange={(value) => setNewKey({ ...newKey, service: value })}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="サービスを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceOptions.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        {service.icon} {service.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>APIキー</Label>
                <Input
                  type="password"
                  value={newKey.key}
                  onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                  placeholder="APIキーを入力"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label>説明</Label>
                <Textarea
                  value={newKey.description}
                  onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
                  placeholder="このAPIキーの用途を説明"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label>有効期限 (オプション)</Label>
                <Input
                  type="date"
                  value={newKey.expiresAt}
                  onChange={(e) => setNewKey({ ...newKey, expiresAt: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddKey} className="flex-1">
                  追加
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                  キャンセル
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#161926] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">総APIキー数</p>
                <p className="text-2xl font-bold text-white">{apiKeys.length}</p>
              </div>
              <Key className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161926] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">有効なキー</p>
                <p className="text-2xl font-bold text-green-400">
                  {apiKeys.filter((key) => key.status === "active").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161926] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">今日の使用回数</p>
                <p className="text-2xl font-bold text-purple-400">
                  {apiKeys.reduce((sum, key) => sum + key.usageCount, 0)}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161926] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">期限切れ間近</p>
                <p className="text-2xl font-bold text-orange-400">0</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys List */}
      <Card className="bg-[#161926] border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-400" />
            登録済みAPIキー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{getServiceIcon(apiKey.service)}</span>
                      <h3 className="font-semibold text-white">{apiKey.name}</h3>
                      {getStatusBadge(apiKey.status)}
                    </div>

                    <p className="text-sm text-gray-400 mb-3">{apiKey.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">APIキー:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-gray-900 px-2 py-1 rounded text-xs font-mono">
                            {showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                          >
                            {showKeys[apiKey.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(apiKey.key)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-400">最終使用:</span>
                        <p className="text-white">{apiKey.lastUsed}</p>
                      </div>

                      <div>
                        <span className="text-gray-400">使用回数:</span>
                        <p className="text-white">{apiKey.usageCount.toLocaleString()}</p>
                      </div>

                      <div>
                        <span className="text-gray-400">作成日:</span>
                        <p className="text-white">{apiKey.createdAt}</p>
                      </div>

                      <div>
                        <span className="text-gray-400">レート制限:</span>
                        <p className="text-white">{apiKey.rateLimit}</p>
                      </div>

                      {apiKey.expiresAt && (
                        <div>
                          <span className="text-gray-400">有効期限:</span>
                          <p className="text-white">{apiKey.expiresAt}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" size="icon" onClick={() => handleEditKey(apiKey)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#161926] border-gray-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle>APIキーを削除</AlertDialogTitle>
                          <AlertDialogDescription>
                            「{apiKey.name}」を削除してもよろしいですか？この操作は取り消せません。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteKey(apiKey.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            削除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-red-500/10 border-red-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-red-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-400">セキュリティに関する重要な注意事項</h4>
              <ul className="text-sm text-red-300 mt-1 space-y-1">
                <li>• APIキーは安全に暗号化されて保存されています</li>
                <li>• 定期的にAPIキーをローテーションすることを推奨します</li>
                <li>• 不要になったAPIキーは速やかに削除してください</li>
                <li>• APIキーの共有や外部への漏洩は絶対に避けてください</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
