"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, GitFork, TrendingUp, Search, Network } from "lucide-react"
import { useEffect, useRef } from "react"

export default function BlockchainExplorerSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const nodes: ExplorerNode[] = []
    const transactions: Transaction[] = []
    const nodeCount = 12

    // Create nodes representing different entities
    for (let i = 0; i < nodeCount; i++) {
      const type = i < 3 ? "politician" : i < 7 ? "company" : "organization"
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: type === "politician" ? 8 : type === "company" ? 6 : 4,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        type,
        connections: 0,
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    // Create transactions
    for (let i = 0; i < 8; i++) {
      const source = Math.floor(Math.random() * nodeCount)
      let target = Math.floor(Math.random() * nodeCount)
      while (target === source) {
        target = Math.floor(Math.random() * nodeCount)
      }

      transactions.push({
        source,
        target,
        amount: Math.floor(Math.random() * 5000000) + 1000000,
        progress: Math.random(),
        speed: Math.random() * 0.008 + 0.003,
        active: Math.random() > 0.7,
      })

      nodes[source].connections++
      nodes[target].connections++
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const time = Date.now() * 0.001

      // Draw connections
      transactions.forEach((tx) => {
        const sourceNode = nodes[tx.source]
        const targetNode = nodes[tx.target]

        // Draw connection line
        ctx.beginPath()
        ctx.moveTo(sourceNode.x, sourceNode.y)
        ctx.lineTo(targetNode.x, targetNode.y)
        ctx.strokeStyle = "rgba(100, 116, 139, 0.3)"
        ctx.lineWidth = 1
        ctx.stroke()

        // Animate transaction flow
        if (tx.active) {
          tx.progress += tx.speed
          if (tx.progress >= 1) {
            tx.progress = 0
          }

          const x = sourceNode.x + (targetNode.x - sourceNode.x) * tx.progress
          const y = sourceNode.y + (targetNode.y - sourceNode.y) * tx.progress

          // Draw transaction particle
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fillStyle = "#6ee7b7"
          ctx.fill()

          // Draw glow
          ctx.beginPath()
          ctx.arc(x, y, 8, 0, Math.PI * 2)
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8)
          gradient.addColorStop(0, "rgba(110, 231, 183, 0.8)")
          gradient.addColorStop(1, "rgba(110, 231, 183, 0)")
          ctx.fillStyle = gradient
          ctx.fill()

          // Show amount at midpoint
          if (tx.progress > 0.45 && tx.progress < 0.55) {
            ctx.font = "10px Inter, sans-serif"
            ctx.fillStyle = "#ffffff"
            ctx.textAlign = "center"
            ctx.fillText(
              `¥${(tx.amount / 10000).toFixed(0)}万`,
              sourceNode.x + (targetNode.x - sourceNode.x) * 0.5,
              sourceNode.y + (targetNode.y - sourceNode.y) * 0.5 - 10,
            )
          }
        }
      })

      // Draw nodes
      nodes.forEach((node) => {
        // Update position
        node.x += node.vx
        node.y += node.vy

        // Bounce off walls
        if (node.x < node.radius || node.x > canvas.width - node.radius) node.vx *= -1
        if (node.y < node.radius || node.y > canvas.height - node.radius) node.vy *= -1

        // Pulsing effect based on connections
        const pulse = Math.sin(time * 2 + node.pulsePhase) * 0.2 + 0.8
        const currentRadius = node.radius * (1 + node.connections * 0.1) * pulse

        // Draw node glow
        ctx.beginPath()
        ctx.arc(node.x, node.y, currentRadius + 6, 0, Math.PI * 2)
        const glowGradient = ctx.createRadialGradient(node.x, node.y, currentRadius, node.x, node.y, currentRadius + 10)
        const color = node.type === "politician" ? "#ff6b6b" : node.type === "company" ? "#4ecdc4" : "#a8e6cf"
        glowGradient.addColorStop(0, color + "80")
        glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)")
        ctx.fillStyle = glowGradient
        ctx.fill()

        // Draw main node
        ctx.beginPath()
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()

        // Draw border
        ctx.beginPath()
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2)
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.stroke()
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

  return (
    <motion.section
      className="py-20 bg-gradient-to-b from-[#0f111a] to-[#0d0f17]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <motion.div
            className="space-y-6 order-2 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                ブロックチェーンエクスプローラー
              </h2>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                暗号通貨の取引を追跡するように、政治資金の流れを可視化。複雑な資金ネットワークを直感的に理解できます。
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {[
                { icon: GitFork, title: "資金フロー追跡", desc: "送金元から受取先まで完全追跡" },
                { icon: TrendingUp, title: "時系列分析", desc: "資金の流れの時間的変化を可視化" },
                { icon: Search, title: "高度検索", desc: "条件を絞った詳細な資金検索" },
                { icon: Network, title: "関係性マップ", desc: "エンティティ間の複雑な関係を表示" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/50"
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(31, 41, 55, 0.5)" }}
                  transition={{ duration: 0.2 }}
                >
                  <feature.icon className="h-4 w-4 md:h-5 md:w-5 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white text-sm">{feature.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-xl w-full sm:w-auto"
              >
                エクスプローラーを開く
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Interactive visualization */}
          <motion.div
            className="relative order-1 lg:order-2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative rounded-2xl border border-gray-800 bg-[#161926] p-4 md:p-6 shadow-2xl">
              <div className="relative w-full h-[300px] md:h-[400px]">
                <canvas ref={canvasRef} className="w-full h-full rounded-lg" />

                {/* Legend */}
                <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 bg-[#0f111a]/90 backdrop-blur-sm p-2 md:p-3 rounded-lg border border-gray-800 text-xs">
                  <div className="space-y-1 md:space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#ff6b6b]"></span>
                      <span className="text-gray-300 text-xs">政治家</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#4ecdc4]"></span>
                      <span className="text-gray-300 text-xs">企業</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#a8e6cf]"></span>
                      <span className="text-gray-300 text-xs">団体</span>
                    </div>
                  </div>
                </div>

                {/* Live indicator */}
                <div className="absolute top-2 md:top-4 right-2 md:right-4 flex items-center gap-2 bg-[#0f111a]/90 backdrop-blur-sm px-2 md:px-3 py-1 md:py-2 rounded-lg border border-gray-800">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-300">リアルタイム</span>
                </div>
              </div>
            </div>

            {/* Floating glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 rounded-2xl blur-xl -z-10"></div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

interface ExplorerNode {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  type: "politician" | "company" | "organization"
  connections: number
  pulsePhase: number
}

interface Transaction {
  source: number
  target: number
  amount: number
  progress: number
  speed: number
  active: boolean
}
