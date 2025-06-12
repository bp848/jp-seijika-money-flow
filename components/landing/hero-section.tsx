"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Bot, Send, Sparkles, MessageCircle } from "lucide-react"

interface HeroSectionProps {
  onChatToggle: () => void
}

export function HeroSection({ onChatToggle }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const nodes: Node[] = []
    const connections: Connection[] = []
    const nodeCount = 15

    // Create subtle background nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 2,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        type: Math.random() > 0.5 ? "source" : "target",
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    // Create subtle connections
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (Math.random() > 0.9) {
          connections.push({
            source: i,
            target: j,
            active: false,
            progress: 0,
            speed: Math.random() * 0.005 + 0.002,
            opacity: 0.3,
          })
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const time = Date.now() * 0.001

      // Draw subtle connections
      connections.forEach((conn) => {
        const sourceNode = nodes[conn.source]
        const targetNode = nodes[conn.target]

        ctx.beginPath()
        ctx.moveTo(sourceNode.x, sourceNode.y)
        ctx.lineTo(targetNode.x, targetNode.y)
        ctx.strokeStyle = `rgba(100, 116, 139, ${conn.opacity * 0.2})`
        ctx.lineWidth = 0.5
        ctx.stroke()

        // Occasional flowing light
        if (Math.random() > 0.998) {
          conn.active = true
        }

        if (conn.active) {
          conn.progress += conn.speed
          if (conn.progress >= 1) {
            conn.active = false
            conn.progress = 0
          } else {
            const x = sourceNode.x + (targetNode.x - sourceNode.x) * conn.progress
            const y = sourceNode.y + (targetNode.y - sourceNode.y) * conn.progress

            ctx.beginPath()
            ctx.arc(x, y, 2, 0, Math.PI * 2)
            ctx.fillStyle = sourceNode.type === "source" ? "rgba(110, 231, 183, 0.6)" : "rgba(196, 181, 253, 0.6)"
            ctx.fill()
          }
        }
      })

      // Draw subtle nodes
      nodes.forEach((node) => {
        node.x += node.vx
        node.y += node.vy

        if (node.x < node.radius || node.x > canvas.width - node.radius) node.vx *= -1
        if (node.y < node.radius || node.y > canvas.height - node.radius) node.vy *= -1

        const pulse = Math.sin(time * 1.5 + node.pulsePhase) * 0.2 + 0.8
        const currentRadius = node.radius * pulse

        ctx.beginPath()
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2)
        ctx.fillStyle = node.type === "source" ? "rgba(110, 231, 183, 0.4)" : "rgba(196, 181, 253, 0.4)"
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    const resizeObserver = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    })

    resizeObserver.observe(canvas)
    animate()

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onChatToggle()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const exampleQuestions = [
    "IT業界から最も献金を受けた政治家は？",
    "○○党の主要な資金源を教えて",
    "建設業界の政治献金推移を分析",
  ]

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f111a] via-[#131629] to-[#0f111a]"></div>

      {/* Subtle animated background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

      {/* Floating light orbs */}
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          className="max-w-4xl mx-auto space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Main headline */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight">
              政治資金の透明化を、
              <motion.span
                className="block bg-gradient-to-r from-cyan-400 via-cyan-300 to-purple-500 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                誰もが自由に。
              </motion.span>
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              ブロックチェーンエクスプローラーのように資金の流れを追い、AI対話で深く理解する。
            </p>
          </div>

          {/* Main search/chat interface */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Search bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl p-2 md:p-3 shadow-2xl">
                <div className="flex items-center gap-2 md:gap-3">
                  <Search className="h-5 w-5 md:h-6 md:w-6 text-gray-400 flex-shrink-0" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="政治家名、企業名、政党名で検索、またはAIに質問..."
                    className="flex-1 h-10 md:h-12 bg-transparent border-0 text-base md:text-lg text-white placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                  />
                  <Button
                    onClick={handleSearch}
                    size="sm"
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-3 md:px-4 py-2 rounded-xl"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-2xl blur-xl -z-10"></div>
            </div>

            {/* Primary AI Chat CTA - Much more prominent */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
                <Button
                  onClick={onChatToggle}
                  size="lg"
                  className="relative bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-2xl text-xl md:text-2xl px-12 md:px-16 py-6 md:py-8 rounded-3xl overflow-hidden group font-bold"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.8 }}
                  />
                  <MessageCircle className="mr-3 md:mr-4 h-7 w-7 md:h-8 md:w-8" />
                  <span className="hidden sm:inline">AIアナリストと対話を始める</span>
                  <span className="sm:hidden">AIと対話を始める</span>
                  <Sparkles className="ml-3 md:ml-4 h-7 w-7 md:h-8 md:w-8" />
                </Button>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity -z-10"></div>
              </motion.div>

              {/* AI Chat description */}
              <motion.p
                className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                💬 自然な言葉で質問するだけで、AIが膨大な政治資金データから答えを導き出します
              </motion.p>
            </motion.div>

            {/* Quick examples - More prominent */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <p className="text-gray-400 text-sm md:text-base font-medium">💡 こんな質問ができます：</p>
              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                {exampleQuestions.map((example, i) => (
                  <motion.button
                    key={i}
                    onClick={() => {
                      setSearchQuery(example)
                      onChatToggle()
                    }}
                    className="px-4 md:px-6 py-2 md:py-3 bg-gray-800/60 border border-gray-600 rounded-2xl text-sm md:text-base text-gray-300 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-gray-700/60 transition-all duration-300 backdrop-blur-sm"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
                  >
                    <span className="hidden sm:inline">{example}</span>
                    <span className="sm:hidden">
                      {i === 0 ? "IT業界献金" : i === 1 ? "政党資金源" : "建設業界分析"}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Mobile-specific floating AI button */}
      <motion.div
        className="fixed bottom-6 right-6 z-40 md:hidden"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
      >
        <motion.button
          onClick={onChatToggle}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-2xl flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            boxShadow: [
              "0 0 20px rgba(6, 182, 212, 0.5)",
              "0 0 30px rgba(147, 51, 234, 0.5)",
              "0 0 20px rgba(6, 182, 212, 0.5)",
            ],
          }}
          transition={{
            boxShadow: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          }}
        >
          <Bot className="h-8 w-8" />
        </motion.button>
      </motion.div>
    </section>
  )
}

interface Node {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  type: "source" | "target"
  pulsePhase: number
}

interface Connection {
  source: number
  target: number
  active: boolean
  progress: number
  speed: number
  opacity: number
}
