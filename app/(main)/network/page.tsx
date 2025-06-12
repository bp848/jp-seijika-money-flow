"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useFundFlows } from "@/hooks/use-fund-flows"
import NetworkGraph from "@/components/network-graph"
import TimeSlider from "@/components/time-slider"

export default function NetworkPage() {
  const { flows, isLoading, isError, isEmpty } = useFundFlows(5000)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  const maxIndex = useMemo(() => (flows?.length || 1) - 1, [flows])

  const currentLabel = useMemo(() => {
    if (!flows || flows.length === 0) return "---"
    const currentFlow = flows[currentIndex]
    return currentFlow?.flow_date.toLocaleDateString("ja-JP") || "---"
  }, [flows, currentIndex])

  const handlePlayPauseToggle = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  const handleReset = useCallback(() => {
    setCurrentIndex(0)
    setIsPlaying(false)
  }, [])

  const handleEnd = useCallback(() => {
    setCurrentIndex(maxIndex)
    setIsPlaying(false)
  }, [maxIndex])

  useEffect(() => {
    if (!isPlaying || !flows || flows.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex >= maxIndex) {
          setIsPlaying(false)
          return maxIndex
        }
        return prevIndex + 1
      })
    }, 80)

    return () => clearInterval(timer)
  }, [isPlaying, flows, maxIndex])

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600 font-medium">資金フローデータを読み込み中...</div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl font-bold mb-2">データ取得エラー</div>
          <div className="text-gray-600">データベース接続を確認してください</div>
        </div>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-600 text-xl font-medium mb-2">表示するデータがありません</div>
          <div className="text-gray-500">資金フローデータを追加してください</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-screen">
      <NetworkGraph flows={flows!} visibleCount={currentIndex + 1} />
      <TimeSlider
        currentIndex={currentIndex}
        maxIndex={maxIndex}
        currentLabel={currentLabel}
        isPlaying={isPlaying}
        onIndexChange={setCurrentIndex}
        onPlayPauseToggle={handlePlayPauseToggle}
        onReset={handleReset}
        onEnd={handleEnd}
      />
    </div>
  )
}
