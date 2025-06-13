"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Transaction } from "@/types"
import { FileText } from "lucide-react"

interface TransactionDetailModalProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
}

export default function TransactionDetailModal({ transaction, isOpen, onClose }: TransactionDetailModalProps) {
  if (!transaction) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>トランザクション詳細</DialogTitle>
          <DialogDescription>{new Date(transaction.date).toLocaleString("ja-JP")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm font-medium text-gray-500">資金源 (From)</p>
            <p className="font-semibold">{transaction.from}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">資金先 (To)</p>
            <p className="font-semibold">{transaction.to}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">金額</p>
            <p className="font-bold text-xl text-primary">¥{transaction.amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">摘要</p>
            <p>{transaction.description}</p>
          </div>
          <Button className="w-full" onClick={() => window.open(transaction.documentUrl, "_blank")}>
            <FileText className="mr-2 h-4 w-4" />
            関連資料を閲覧 (PDF)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
