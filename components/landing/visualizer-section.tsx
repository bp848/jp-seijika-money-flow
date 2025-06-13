"use client"

import { motion } from "framer-motion"
import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

// Changed from default export to named export
export function VisualizerSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Debounce resize handler
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        if (canvas) {
          canvas.width = canvas.offsetWidth
          canvas.height = canvas.offsetHeight
        }
      }, 100)
    }

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const nodes: VisualizerNode[] = []
    const nodeCount = 30 // Reduced for potentially better performance on some devices

    // Create nodes with different types
    for (let i = 0; i < nodeCount; i++) {
      const type = Math.random() < 0.3 ? "politician" : Math.random() < 0.6 ? "company" : "organization"

      nodes.push({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: type === "politician" ? 8 : type === "company" ? 6 : 4,
        vx: (Math.random() - 0.5) * 0.2, // Slower initial movement
        vy: (Math.random() - 0.5) * 0.2,
        type,
        connections: [],
      })
    }

    // Create connections between nodes
    for (let i = 0; i < nodeCount; i++) {
      const connectionCount = Math.floor(Math.random() * 2) + 1 // Max 1-2 connections

      for (let j = 0; j < connectionCount; j++) {
        const targetIndex = Math.floor(Math.random() * nodeCount)
        if (
          targetIndex !== i &&
          !nodes[i].connections.some((c) => c.target === targetIndex) &&
          !nodes[targetIndex].connections.some((c) => c.target === i)
        ) {
          // Avoid duplicate connections
          const amount = Math.floor(Math.random() * 9000000) + 1000000

          nodes[i].connections.push({
            target: targetIndex,
            amount,
            active: false,
            progress: 0,
            speed: Math.random() * 0.003 + 0.0005, // Slower animation
            lastActivated: 0,
          })
        }
      }
    }

    const getNodeColor = (type: string) => {
      switch (type) {
        case "politician":
          return "#6ee7b7" // Green
        case "company":
          return "#c4b5fd" // Purple
        case "organization":
          return "#93c5fd" // Blue
        default:
          return "#ffffff"
      }
    }

    let hoverNode: number | null = null
    let animationFrameId: number

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      hoverNode = null

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        const dx = x - node.x
        const dy = y - node.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < node.radius + 5) {
          // Increased hover radius
          hoverNode = i
          break
        }
      }
    })

    canvas.addEventListener("mouseleave", () => {
      hoverNode = null
    })

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      nodes.forEach((node) => {
        node.connections.forEach((conn) => {
          const targetNode = nodes[conn.target]
          if (!targetNode) return

          // Draw connection line
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(targetNode.x, targetNode.y)
          ctx.strokeStyle = "rgba(100, 116, 139, 0.15)"
          ctx.lineWidth = 0.5
          ctx.stroke()

          // Randomly activate connections
          const now = Date.now()
          if (Math.random() > 0.999 && now - conn.lastActivated > 7000) {
            // Less frequent activation
            conn.active = true
            conn.lastActivated = now
          }

          // Animate data flow
          if (conn.active) {
            conn.progress += conn.speed

            if (conn.progress >= 1) {
              conn.active = false
              conn.progress = 0
            } else {
              const currentX = node.x + (targetNode.x - node.x) * conn.progress
              const currentY = node.y + (targetNode.y - node.y) * conn.progress

              // Draw flowing data point
              ctx.beginPath()
              ctx.arc(currentX, currentY, 3, 0, Math.PI * 2)
              ctx.fillStyle = getNodeColor(node.type)
              ctx.fill()

              // Draw amount text at midpoint
              if (conn.progress > 0.45 && conn.progress < 0.55) {
                ctx.font = "10px Inter, sans-serif"
                ctx.fillStyle = "#ffffff"
                ctx.textAlign = "center"
                ctx.fillText(
                  `¥${(conn.amount / 10000).toFixed(0)}万`,
                  node.x + (targetNode.x - node.x) * 0.5,
                  node.y + (targetNode.y - node.y) * 0.5 - 10,
                )
              }
            }
          }
        })
      })

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Update position
        node.x += node.vx
        node.y += node.vy

        // Bounce off walls
        if (node.x < node.radius || node.x > canvas.width - node.radius) node.vx *= -1
        if (node.y < node.radius || node.y > canvas.height - node.radius) node.vy *= -1

        // Draw node
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = getNodeColor(node.type)
        ctx.fill()

        // Draw glow effect
        if (hoverNode === i) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2)
          const gradient = ctx.createRadialGradient(node.x, node.y, node.radius, node.x, node.y, node.radius + 15)
          gradient.addColorStop(0, `${getNodeColor(node.type)}99`) // Semi-transparent
          gradient.addColorStop(1, "rgba(0, 0, 0, 0)")
          ctx.fillStyle = gradient
          ctx.fill()

          // Draw node info
          ctx.font = "bold 12px Inter, sans-serif"
          ctx.fillStyle = "#ffffff"
          ctx.textAlign = "center"
          ctx.fillText(
            node.type === "politician" ? "政治家" : node.type === "company" ? "企業" : "団体",
            node.x,
            node.y - node.radius - 10,
          )
        }
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    if (canvas) {
      resizeObserver.observe(canvas)
    }

    animate()

    return () => {
      if (canvas) {
        resizeObserver.unobserve(canvas)
      }
      cancelAnimationFrame(animationFrameId)
      clearTimeout(resizeTimeout)
    }
  }, [])

  return (
    <motion.section
      className="py-16 bg-[#0d0f17] overflow-hidden" // Added overflow-hidden
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="md:w-1/2">
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-1">
              資金の流れを、ひと目で。
            </h2>
            <p className="mt-4 text-gray-300 leading-relaxed">
              政治家、企業、団体間の複雑な資金の流れをインタラクティブなグラフで可視化。
              気になるポイントをクリックして、金の流れを追跡できます。
            </p>
            <div className="mt-6">
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg transform transition-transform hover:scale-105">
                グラフを探索する
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="md:w-1/2 mt-10 md:mt-0">
            <div className="rounded-xl border border-gray-800 bg-[#161926]/70 backdrop-blur-sm p-1 shadow-2xl">
              <div className="relative w-full h-[350px] lg:h-[400px]">
                <canvas ref={canvasRef} className="w-full h-full rounded-lg" />
                <div className="absolute bottom-4 left-4 bg-[#0f111a]/80 backdrop-blur-sm p-3 rounded-lg border border-gray-700 text-xs text-left shadow-md">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-[#6ee7b7] shadow-sm"></span>
                    <span className="text-gray-200">政治家</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-[#c4b5fd] shadow-sm"></span>
                    <span className="text-gray-200">企業</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#93c5fd] shadow-sm"></span>
                    <span className="text-gray-200">団体</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

interface VisualizerNode {
  id: number
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  type: string
  connections: {
    target: number
    amount: number
    active: boolean
    progress: number
    speed: number
    lastActivated: number
  }[]
}
