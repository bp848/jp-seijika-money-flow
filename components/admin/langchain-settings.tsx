"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bot,
  Save,
  RotateCcw,
  Play,
  Settings,
  MessageSquare,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react"

export default function LangChainSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastSaved, setLastSaved] = useState("2024-12-09 10:30:00")

  const [config, setConfig] = useState({
    // Model Settings
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,

    // Chain Configuration
    chainType: "conversation",
    memoryType: "buffer",
    maxMemoryLength: 10,
    enableStreaming: true,

    // Prompts
    systemPrompt: `あなたは政治資金の透明化を支援するAIアナリストです。
政治資金収支報告書のデータを分析し、ユーザーの質問に対して正確で分かりやすい回答を提供してください。

以下の点に注意してください：
1. 事実に基づいた客観的な分析を行う
2. 複雑なデータを分かりやすく説明する
3. 必要に応じてグラフや表での表示を提案する
4. 政治的な偏見を避け、中立的な立場を保つ`,

    userPromptTemplate: `質問: {question}

関連データ: {context}

上記の情報を基に、質問に対して詳細で分かりやすい回答を提供してください。`,

    // Advanced Settings
    enableRetrieval: true,
    retrievalTopK: 5,
    enableFactChecking: true,
    responseLanguage: "ja",
    enableCaching: true,
    cacheExpiry: 3600,
  })

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLastSaved(new Date().toLocaleString("ja-JP"))
    setIsLoading(false)
  }

  const handleReset = () => {
    // Reset to default values
    setConfig({
      ...config,
      temperature: 0.7,
      maxTokens: 2048,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
    })
  }

  const handleTestConfiguration = async () => {
    setIsLoading(true)
    // Simulate test
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            LangChain設定管理
          </h1>
          <p className="text-gray-400 mt-2">AI応答システムの詳細設定とパラメータ調整</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            設定適用済み
          </Badge>
          <span className="text-sm text-gray-400">最終保存: {lastSaved}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500"
        >
          {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          設定を保存
        </Button>
        <Button variant="outline" onClick={handleTestConfiguration} disabled={isLoading}>
          <Play className="h-4 w-4 mr-2" />
          設定をテスト
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          デフォルトに戻す
        </Button>
      </div>

      <Tabs defaultValue="model" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-[#161926] border border-gray-800">
          <TabsTrigger value="model" className="data-[state=active]:bg-cyan-500/20">
            <Bot className="h-4 w-4 mr-2" />
            モデル設定
          </TabsTrigger>
          <TabsTrigger value="chain" className="data-[state=active]:bg-cyan-500/20">
            <Settings className="h-4 w-4 mr-2" />
            チェーン設定
          </TabsTrigger>
          <TabsTrigger value="prompts" className="data-[state=active]:bg-cyan-500/20">
            <MessageSquare className="h-4 w-4 mr-2" />
            プロンプト設定
          </TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-cyan-500/20">
            <Zap className="h-4 w-4 mr-2" />
            高度な設定
          </TabsTrigger>
        </TabsList>

        {/* Model Settings */}
        <TabsContent value="model">
          <Card className="bg-[#161926] border-gray-800">
            <CardHeader>
              <CardTitle>AIモデル設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>モデル選択</Label>
                  <Select value={config.model} onValueChange={(value) => setConfig({ ...config, model: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o (推奨)</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>最大トークン数</Label>
                  <Input
                    type="number"
                    value={config.maxTokens}
                    onChange={(e) => setConfig({ ...config, maxTokens: Number(e.target.value) })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Temperature: {config.temperature}</Label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => setConfig({ ...config, temperature: Number(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-400">低い値: より一貫性のある応答 / 高い値: より創造的な応答</p>
                </div>

                <div className="space-y-2">
                  <Label>Top P: {config.topP}</Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.topP}
                    onChange={(e) => setConfig({ ...config, topP: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Frequency Penalty: {config.frequencyPenalty}</Label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={config.frequencyPenalty}
                    onChange={(e) => setConfig({ ...config, frequencyPenalty: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Presence Penalty: {config.presencePenalty}</Label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={config.presencePenalty}
                    onChange={(e) => setConfig({ ...config, presencePenalty: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chain Settings */}
        <TabsContent value="chain">
          <Card className="bg-[#161926] border-gray-800">
            <CardHeader>
              <CardTitle>チェーン構成設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>チェーンタイプ</Label>
                  <Select
                    value={config.chainType}
                    onValueChange={(value) => setConfig({ ...config, chainType: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversation">会話チェーン</SelectItem>
                      <SelectItem value="retrieval">検索拡張チェーン</SelectItem>
                      <SelectItem value="sequential">シーケンシャルチェーン</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>メモリタイプ</Label>
                  <Select
                    value={config.memoryType}
                    onValueChange={(value) => setConfig({ ...config, memoryType: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buffer">バッファメモリ</SelectItem>
                      <SelectItem value="summary">サマリーメモリ</SelectItem>
                      <SelectItem value="token">トークンバッファ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>メモリ最大長</Label>
                  <Input
                    type="number"
                    value={config.maxMemoryLength}
                    onChange={(e) => setConfig({ ...config, maxMemoryLength: Number(e.target.value) })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.enableStreaming}
                    onCheckedChange={(checked) => setConfig({ ...config, enableStreaming: checked })}
                  />
                  <Label>ストリーミング応答を有効化</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prompt Settings */}
        <TabsContent value="prompts">
          <div className="space-y-6">
            <Card className="bg-[#161926] border-gray-800">
              <CardHeader>
                <CardTitle>システムプロンプト</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={config.systemPrompt}
                  onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                  className="min-h-[200px] bg-gray-800 border-gray-700"
                  placeholder="システムプロンプトを入力..."
                />
                <p className="text-xs text-gray-400 mt-2">AIの役割と基本的な動作を定義するプロンプトです。</p>
              </CardContent>
            </Card>

            <Card className="bg-[#161926] border-gray-800">
              <CardHeader>
                <CardTitle>ユーザープロンプトテンプレート</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={config.userPromptTemplate}
                  onChange={(e) => setConfig({ ...config, userPromptTemplate: e.target.value })}
                  className="min-h-[150px] bg-gray-800 border-gray-700"
                  placeholder="ユーザープロンプトテンプレートを入力..."
                />
                <p className="text-xs text-gray-400 mt-2">
                  使用可能な変数: {"{question}"}, {"{context}"}, {"{history}"}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced">
          <Card className="bg-[#161926] border-gray-800">
            <CardHeader>
              <CardTitle>高度な設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.enableRetrieval}
                    onCheckedChange={(checked) => setConfig({ ...config, enableRetrieval: checked })}
                  />
                  <Label>検索拡張生成 (RAG) を有効化</Label>
                </div>

                <div className="space-y-2">
                  <Label>検索結果上位K件</Label>
                  <Input
                    type="number"
                    value={config.retrievalTopK}
                    onChange={(e) => setConfig({ ...config, retrievalTopK: Number(e.target.value) })}
                    className="bg-gray-800 border-gray-700"
                    disabled={!config.enableRetrieval}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.enableFactChecking}
                    onCheckedChange={(checked) => setConfig({ ...config, enableFactChecking: checked })}
                  />
                  <Label>ファクトチェック機能を有効化</Label>
                </div>

                <div className="space-y-2">
                  <Label>応答言語</Label>
                  <Select
                    value={config.responseLanguage}
                    onValueChange={(value) => setConfig({ ...config, responseLanguage: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="auto">自動検出</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.enableCaching}
                    onCheckedChange={(checked) => setConfig({ ...config, enableCaching: checked })}
                  />
                  <Label>応答キャッシュを有効化</Label>
                </div>

                <div className="space-y-2">
                  <Label>キャッシュ有効期限 (秒)</Label>
                  <Input
                    type="number"
                    value={config.cacheExpiry}
                    onChange={(e) => setConfig({ ...config, cacheExpiry: Number(e.target.value) })}
                    className="bg-gray-800 border-gray-700"
                    disabled={!config.enableCaching}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Warning Notice */}
      <Card className="bg-yellow-500/10 border-yellow-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-400">設定変更時の注意事項</h4>
              <p className="text-sm text-yellow-300 mt-1">
                設定を変更すると、AI応答の品質や速度に影響する可能性があります。
                本番環境での変更前に、必ずテスト機能を使用して動作を確認してください。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
