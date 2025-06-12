"use client"

import { Search, Bot, MessageCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

// Changed from default export to named export
export function SearchSection() {
  return (
    <motion.section
      className="py-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto flex flex-col items-center gap-8 px-4">
        <div className="relative w-full max-w-3xl">
          {/* Glassmorphism search bar */}
          <div className="relative backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-2 shadow-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="政治家名「田中太郎」、企業名「○○株式会社」、政党名「△△党」で検索..."
                className="h-16 w-full rounded-xl bg-transparent border-0 pl-14 pr-4 text-lg text-white placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Floating glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-2xl blur-xl -z-10"></div>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
          <Button
            size="lg"
            className="relative bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 text-lg px-8 py-4 rounded-xl overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.8 }}
            />
            <MessageCircle className="mr-3 h-6 w-6" />
            AIに質問する
            <Bot className="ml-3 h-6 w-6" />
          </Button>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity -z-10"></div>
        </motion.div>

        {/* Example queries */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-sm text-gray-400 mb-3">例：</p>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            {[
              "IT業界から最も献金を受けた政治家は？",
              "○○党の資金源トップ5を教えて",
              "建設業界の政治献金の推移を分析して",
            ].map((example, i) => (
              <motion.span
                key={i}
                className="px-3 py-1 bg-gray-800/50 border border-gray-700 rounded-full text-gray-300 hover:text-cyan-400 hover:border-cyan-400/50 cursor-pointer transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                {example}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
