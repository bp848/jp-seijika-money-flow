"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Search, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TestResult {
  testName: string
  status: "success" | "error" | "pending"
  message: string
  duration?: number
  data?: any
}

interface TestCase {
  name: string
  description: string
  params: Record<string, string>
  expectedResults: {
    minResults?: number
    maxResults?: number
    shouldContain?: string[]
    shouldNotContain?: string[]
  }
}

export default function PoliticiansSearchTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string>("")
  const { toast } = useToast()

  // テストケース定義
  const testCases: TestCase[] = [
    {
      name: "基本検索テスト",
      description: "政治家名での基本検索機能",
      params: { search: "田中" },
      expectedResults: {
        minResults: 1,
        shouldContain: ["田中"],
      },
    },
    {
      name: "ふりがな検索テスト",
      description: "ふりがなでの検索機能",
      params: { search: "たなか" },
      expectedResults: {
        minResults: 1,
      },
    },
    {
      name: "会派フィルターテスト",
      description: "自民党議員のフィルタリング",
      params: { party: "自民" },
      expectedResults: {
        minResults: 1,
      },
    },
    {
      name: "議会種別フィルターテスト",
      description: "参議院議員のフィルタリング",
      params: { legislature: "house_of_councillors" },
      expectedResults: {
        minResults: 1,
      },
    },
    {
      name: "選挙区検索テスト",
      description: "東京都選出議員の検索",
      params: { search: "東京" },
      expectedResults: {
        minResults: 1,
        shouldContain: ["東京"],
      },
    },
    {
      name: "複合フィルターテスト",
      description: "会派と議会種別の複合フィルター",
      params: { party: "自民", legislature: "house_of_councillors" },
      expectedResults: {
        minResults: 1,
      },
    },
    {
      name: "ソート機能テスト（名前昇順）",
      description: "政治家名での昇順ソート",
      params: { sortColumn: "name", sortOrder: "asc" },
      expectedResults: {
        minResults: 1,
      },
    },
    {
      name: "ソート機能テスト（当選回数降順）",
      description: "当選回数での降順ソート",
      params: { sortColumn: "election_count", sortOrder: "desc" },
      expectedResults: {
        minResults: 1,
      },
    },
    {
      name: "ページネーションテスト",
      description: "ページネーション機能",
      params: { page: "2", limit: "5" },
      expectedResults: {
        maxResults: 5,
      },
    },
    {
      name: "空検索テスト",
      description: "検索条件なしでの全件取得",
      params: {},
      expectedResults: {
        minResults: 1,
      },
    },
    {
      name: "存在しない検索テスト",
      description: "存在しない政治家名での検索",
      params: { search: "存在しない政治家名12345" },
      expectedResults: {
        minResults: 0,
        maxResults: 0,
      },
    },
    {
      name: "特殊文字検索テスト",
      description: "特殊文字を含む検索",
      params: { search: "田中　太郎" },
      expectedResults: {
        minResults: 0,
      },
    },
  ]

  // 単一テストケースの実行
  const runSingleTest = async (testCase: TestCase): Promise<TestResult> => {
    const startTime = Date.now()
    setCurrentTest(testCase.name)

    try {
      const params = new URLSearchParams(testCase.params)
      const response = await fetch(`/api/politicians?${params}`)
      const data = await response.json()

      if (!response.ok) {
        return {
          testName: testCase.name,
          status: "error",
          message: `APIエラー: ${data.error || "不明なエラー"}`,
          duration: Date.now() - startTime,
        }
      }

      // 結果の検証
      const results = data.data || []
      const { expectedResults } = testCase

      // 最小件数チェック
      if (expectedResults.minResults !== undefined && results.length < expectedResults.minResults) {
        return {
          testName: testCase.name,
          status: "error",
          message: `期待される最小件数: ${expectedResults.minResults}, 実際: ${results.length}`,
          duration: Date.now() - startTime,
          data: { resultCount: results.length, results: results.slice(0, 3) },
        }
      }

      // 最大件数チェック
      if (expectedResults.maxResults !== undefined && results.length > expectedResults.maxResults) {
        return {
          testName: testCase.name,
          status: "error",
          message: `期待される最大件数: ${expectedResults.maxResults}, 実際: ${results.length}`,
          duration: Date.now() - startTime,
          data: { resultCount: results.length },
        }
      }

      // 含まれるべき文字列チェック
      if (expectedResults.shouldContain) {
        for (const shouldContain of expectedResults.shouldContain) {
          const found = results.some(
            (politician: any) =>
              politician.name?.includes(shouldContain) ||
              politician.name_kana?.includes(shouldContain) ||
              politician.electoral_district?.includes(shouldContain) ||
              politician.party?.includes(shouldContain),
          )
          if (!found) {
            return {
              testName: testCase.name,
              status: "error",
              message: `期待される文字列が見つかりません: "${shouldContain}"`,
              duration: Date.now() - startTime,
              data: { resultCount: results.length, searchTerm: shouldContain },
            }
          }
        }
      }

      // 含まれてはいけない文字列チェック
      if (expectedResults.shouldNotContain) {
        for (const shouldNotContain of expectedResults.shouldNotContain) {
          const found = results.some(
            (politician: any) =>
              politician.name?.includes(shouldNotContain) ||
              politician.name_kana?.includes(shouldNotContain) ||
              politician.electoral_district?.includes(shouldNotContain) ||
              politician.party?.includes(shouldNotContain),
          )
          if (found) {
            return {
              testName: testCase.name,
              status: "error",
              message: `含まれてはいけない文字列が見つかりました: "${shouldNotContain}"`,
              duration: Date.now() - startTime,
              data: { resultCount: results.length, foundTerm: shouldNotContain },
            }
          }
        }
      }

      return {
        testName: testCase.name,
        status: "success",
        message: `テスト成功 (${results.length}件の結果)`,
        duration: Date.now() - startTime,
        data: { resultCount: results.length, sampleResults: results.slice(0, 2) },
      }
    } catch (error) {
      return {
        testName: testCase.name,
        status: "error",
        message: `実行エラー: ${error instanceof Error ? error.message : "不明なエラー"}`,
        duration: Date.now() - startTime,
      }
    }
  }

  // 全テストの実行
  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])
    setCurrentTest("")

    const results: TestResult[] = []

    for (const testCase of testCases) {
      const result = await runSingleTest(testCase)
      results.push(result)
      setTestResults([...results])

      // 各テスト間に少し間隔を空ける
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setCurrentTest("")
    setIsRunning(false)

    // 結果サマリーをトースト表示
    const successCount = results.filter((r) => r.status === "success").length
    const errorCount = results.filter((r) => r.status === "error").length

    toast({
      title: "テスト完了",
      description: `成功: ${successCount}件, 失敗: ${errorCount}件`,
      variant: successCount === results.length ? "default" : "destructive",
    })
  }

  // 個別テストの実行
  const runIndividualTest = async (testCase: TestCase) => {
    setIsRunning(true)
    const result = await runSingleTest(testCase)
    setTestResults((prev) => {
      const filtered = prev.filter((r) => r.testName !== testCase.name)
      return [...filtered, result]
    })
    setIsRunning(false)
  }

  // テスト結果の統計
  const getTestStats = () => {
    const total = testResults.length
    const success = testResults.filter((r) => r.status === "success").length
    const error = testResults.filter((r) => r.status === "error").length
    const avgDuration =
      testResults.length > 0
        ? Math.round(testResults.reduce((sum, r) => sum + (r.duration || 0), 0) / testResults.length)
        : 0

    return { total, success, error, avgDuration }
  }

  const stats = getTestStats()

  return (
    <div className="space-y-6">
      {/* テスト概要 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            政治家検索・フィルター機能テスト
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-muted-foreground">総テスト数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.success}</p>
              <p className="text-sm text-muted-foreground">成功</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.error}</p>
              <p className="text-sm text-muted-foreground">失敗</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.avgDuration}ms</p>
              <p className="text-sm text-muted-foreground">平均実行時間</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={runAllTests} disabled={isRunning} className="flex items-center gap-2">
              {isRunning ? <Clock className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {isRunning ? "テスト実行中..." : "全テスト実行"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setTestResults([])}
              disabled={isRunning || testResults.length === 0}
            >
              結果クリア
            </Button>
          </div>

          {currentTest && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">実行中: {currentTest}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* テストケース一覧 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            テストケース一覧
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testCases.map((testCase, index) => {
              const result = testResults.find((r) => r.testName === testCase.name)
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{testCase.name}</h3>
                      {result && (
                        <Badge
                          variant={result.status === "success" ? "default" : "destructive"}
                          className="flex items-center gap-1"
                        >
                          {result.status === "success" ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {result.status === "success" ? "成功" : "失敗"}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runIndividualTest(testCase)}
                      disabled={isRunning}
                    >
                      実行
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">{testCase.description}</p>

                  <div className="text-xs text-gray-600 mb-2">
                    <strong>パラメータ:</strong> {JSON.stringify(testCase.params)}
                  </div>

                  {result && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">結果:</span>
                        <span className="text-xs text-muted-foreground">{result.duration}ms</span>
                      </div>
                      <p className="text-sm">{result.message}</p>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer text-blue-600">詳細データ</summary>
                          <pre className="text-xs mt-1 p-2 bg-white rounded border overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
