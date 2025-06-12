"use client"

import type React from "react"
import { Play, Pause, SkipBack, SkipForward } from "lucide-react"

interface TimeSliderProps {
  currentIndex: number
  maxIndex: number
  currentLabel: string
  isPlaying: boolean
  onIndexChange: (index: number) => void
  onPlayPauseToggle: () => void
  onReset: () => void
  onEnd: () => void
}

export default function TimeSlider({
  currentIndex,
  maxIndex,
  currentLabel,
  isPlaying,
  onIndexChange,
  onPlayPauseToggle,
  onReset,
  onEnd,
}: TimeSliderProps) {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onIndexChange(Number(e.target.value))
  }

  const isDisabled = maxIndex === 0

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-t shadow-lg">
      <div className="flex items-center gap-4 p-4">
        <button
          onClick={onReset}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          disabled={isDisabled}
          title="最初に戻る"
        >
          <SkipBack size={18} />
        </button>

        <button
          onClick={onPlayPauseToggle}
          className="p-3 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 bg-blue-50 border border-blue-200"
          disabled={isDisabled}
          title={isPlaying ? "一時停止" : "再生"}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <button
          onClick={onEnd}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          disabled={isDisabled}
          title="最後に進む"
        >
          <SkipForward size={18} />
        </button>

        <div className="flex-1 flex items-center gap-4">
          <span className="w-32 text-center font-mono text-sm font-medium">{currentLabel}</span>

          <input
            type="range"
            min={0}
            max={maxIndex}
            value={currentIndex}
            onChange={handleSliderChange}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            disabled={isDisabled}
          />

          <span className="text-sm text-gray-600 font-medium min-w-[80px] text-right">
            {currentIndex + 1} / {maxIndex + 1}
          </span>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  )
}
