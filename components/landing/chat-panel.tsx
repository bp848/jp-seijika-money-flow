"use client"

import type React from "react"

import { useState } from "react"
import { X, Send, Bot, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: "こんにちは！🎯 政治資金について何でもお聞きください。複雑なデータも分かりやすく分析してお答えします。",
    },
  ])
  const [input, setInput] = useState("")

  const quickQuestions = [
    "この1年で最も献金を受けた政治家は？",
    "IT業界からの献金トップ5を教えて",
    "○○党の主要な資金源を分析して",
    "建設業界の政治献金推移を表示して",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    setMessages([...messages, { role: "user", content: input }])

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "申し訳ありませんが、これはデモ版です。実際のAI応答機能は開発中です。正式版では、リアルタイムで政治資金データを分析してお答えします！",
        },
      ])
    }, 1000)

    setInput("")
  }

  const handleQuickQuestion = (question: string) => {
    setInput(question)
    // Auto-submit the question
    setMessages((prev) => [...prev, { role: "user", content: question }])
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `「${question}」について分析中です...実際のサービスでは、この質問に対して詳細なデータ分析結果をグラフや表で表示します。`,
        },
      ])
    }, 1000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Chat Panel */}
          <motion.div
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-[#161926] border border-gray-800 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-800 bg-gradient-to-r from-cyan-500/10 to-purple-600/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
                  <Bot className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg md:text-xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                    AIアナリスト
                  </h2>
                  <p className="text-xs md:text-sm text-gray-400">政治資金データの専門家</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full"
              >
                <X className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
              {messages.map((message, i) => (
                <motion.div
                  key={i}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 md:px-6 md:py-4 text-sm md:text-base leading-relaxed ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                        : "bg-gray-800 text-gray-100 border border-gray-700"
                    }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}

              {/* Quick Questions */}
              {messages.length === 1 && (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <p className="text-gray-400 text-sm md:text-base font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    よくある質問から始めてみませんか？
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    {quickQuestions.map((question, i) => (
                      <motion.button
                        key={i}
                        onClick={() => handleQuickQuestion(question)}
                        className="p-3 md:p-4 text-left bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-cyan-400/50 rounded-xl text-sm md:text-base text-gray-300 hover:text-cyan-400 transition-all duration-300"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                      >
                        {question}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 md:p-6 border-t border-gray-800 bg-[#0f111a]/50">
              <div className="flex gap-3 md:gap-4">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="政治資金について何でも質問してください..."
                  className="flex-1 bg-gray-800 border-gray-700 focus:border-cyan-500 focus:ring-cyan-500/20 text-sm md:text-base h-12 md:h-14 rounded-xl"
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-4 md:px-6 h-12 md:h-14 rounded-xl"
                >
                  <Send className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>
              <div className="mt-3 text-xs md:text-sm text-gray-500 leading-relaxed">
                💡 例: 「この1年で最も献金を受けた政治家は？」「特定企業からの献金推移は？」
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
