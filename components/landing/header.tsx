"use client"

import { useState } from "react"
import { PlusCircle, Bot, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ThemeToggleButton } from "@/components/theme-toggle-button" // 追加

interface HeaderProps {
  scrolled: boolean
  onChatToggle: () => void
}

export default function Header({ scrolled, onChatToggle }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled ? "bg-[#0f111a]/80 backdrop-blur-md border-b border-gray-800" : "bg-transparent",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="#" className="flex items-center gap-2 group">
          <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
            <PlusCircle className="h-6 w-6 md:h-7 md:w-7 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
          </motion.div>
          <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            +Program
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-4 md:gap-6 text-sm font-medium md:flex">
          {" "}
          {/* md:gap-8 から md:gap-6 に微調整 */}
          <NavLink href="/" label="ホーム" />
          <NavLink href="/political-data" label="政治資金の探索をする" />
          <NavLink href="/developer/api-docs" label="API情報" />
          <NavLink href="/contact" label="サポート" />
          <NavLink href="/admin" label="管理画面" />
        </nav>

        <div className="flex items-center gap-2">
          {" "}
          {/* md:block から flex items-center gap-2 に変更 */}
          <div className="hidden md:block">
            <Button
              onClick={onChatToggle}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-md hover:shadow-cyan-500/50 transition-all duration-300"
            >
              <Bot className="mr-2 h-4 w-4" />
              AIチャット
            </Button>
          </div>
          <div className="hidden md:block">
            {" "}
            {/* 追加 */}
            <ThemeToggleButton />
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          {" "}
          {/* 追加: モバイルでもテーマ切り替えを表示 */}
          <ThemeToggleButton />
          <button
            className="text-gray-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="メニューを開く"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div
          className="md:hidden bg-[#161926] border-t border-gray-800"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container mx-auto py-4 px-4 flex flex-col space-y-3">
            <a
              href="/"
              className="py-2 text-gray-300 hover:text-cyan-400 transition-colors text-base"
              onClick={() => setIsMenuOpen(false)}
            >
              ホーム
            </a>
            <a
              href="/political-data"
              className="py-2 text-gray-300 hover:text-cyan-400 transition-colors text-base"
              onClick={() => setIsMenuOpen(false)}
            >
              政治資金の探索をする
            </a>
            <a
              href="/developer/api-docs"
              className="py-2 text-gray-300 hover:text-cyan-400 transition-colors text-base"
              onClick={() => setIsMenuOpen(false)}
            >
              API情報
            </a>
            <a
              href="/contact"
              className="py-2 text-gray-300 hover:text-cyan-400 transition-colors text-base"
              onClick={() => setIsMenuOpen(false)}
            >
              サポート
            </a>
            <a
              href="/admin"
              className="py-2 text-gray-300 hover:text-cyan-400 transition-colors text-base"
              onClick={() => setIsMenuOpen(false)}
            >
              管理画面
            </a>
            <Button
              onClick={() => {
                onChatToggle()
                setIsMenuOpen(false)
              }}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-md hover:shadow-cyan-500/50 transition-all duration-300 mt-3 w-full"
            >
              <Bot className="mr-2 h-4 w-4" />
              AIチャット
            </Button>
            {/* モバイルメニュー内にはテーマ切り替えボタンは配置せず、ヘッダー右上に常時表示としました */}
          </div>
        </motion.div>
      )}
    </header>
  )
}

interface NavLinkProps {
  href: string
  label: string
}

function NavLink({ href, label }: NavLinkProps) {
  return (
    <a href={href} className="relative text-gray-300 hover:text-white transition-colors group">
      {label}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
    </a>
  )
}
