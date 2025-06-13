import { ScrollArea } from "@/components/ui/scroll-area"
import type { AnalysisHistoryItem } from "@/types"

interface AnalysisHistoryProps {
  history: AnalysisHistoryItem[]
}

export default function AnalysisHistory({ history }: AnalysisHistoryProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">過去の分析</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {history.map((item) => (
            <div key={item.id} className="text-sm p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{item.query}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(item.timestamp).toLocaleString("ja-JP")}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
