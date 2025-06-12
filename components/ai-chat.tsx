"use client"

import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Send, Info, User, Bot } from "lucide-react"
import { useRef, useEffect } from "react"

export default function AIChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <Card className="w-full h-full flex flex-col">
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <Info className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">政治資金について質問してみましょう</h3>
            <div className="max-w-md space-y-2">
              <p>実際のPDFデータと資金フローデータに基づいて回答します：</p>
              <div className="text-sm space-y-1">
                <p>• 「自民党への最大の献金企業は？」</p>
                <p>• 「2022年の政治献金の流れは？」</p>
                <p>• 「トヨタ自動車の政治献金先は？」</p>
                <p>• 「広島県の政治資金の特徴は？」</p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {msg.role === "user" ? (
                  <User className="h-6 w-6 text-primary" />
                ) : (
                  <Bot className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className={`flex-1 rounded-lg p-3 ${msg.role === "user" ? "bg-primary/10" : "bg-muted"}`}>
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 border-t bg-background">
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            このチャットは実際のPDF文書とデータベースの資金フローデータに基づいて回答します。
            「分析中」や推測ではなく、具体的なデータのみを提供します。
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="政治資金について具体的に質問してください..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </Card>
  )
}
