"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Key, Users, BarChart3, Menu, X, Shield, LogOut, Home, Bot, Database, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminLayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void // `app/admin/page.tsx` から渡される
}

const navigationItems = [
  {
    id: "dashboard",
    label: "ダッシュボード",
    icon: BarChart3,
    description: "システム概要とステータス",
  },
  {
    id: "langchain",
    label: "AI設定",
    icon: Bot,
    description: "LangChain構成管理",
  },
  {
    id: "api-keys",
    label: "APIキー管理",
    icon: Key,
    description: "外部サービス連携",
  },
  {
    id: "pdf-management", // 新しいPDF管理タブ
    label: "PDF文書管理",
    icon: FileText,
    description: "PDFアップロードと検索",
  },
  {
    id: "users",
    label: "ユーザー管理",
    icon: Users,
    description: "権限とアクセス制御",
    badge: "将来実装",
  },
]

export default function AdminLayout({ children, activeTab, onTabChange }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-[#0f111a] text-gray-100 flex flex-col">
      {/* Header */}
      <header className="flex h-16 items-center border-b-[2px] border-amber-600 dark:border-amber-500 bg-[#161926] px-4 sm:px-6 justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white md:hidden" // モバイルでのみ表示
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-cyan-400" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              +Program 管理画面
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              メインサイトへ
            </Link>
          </Button>
          {/* UserNav やログアウトボタンは必要に応じてここに追���できます */}
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <LogOut className="h-4 w-4 mr-2" />
            ログアウト
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-[#161926] border-r border-gray-800 transition-all duration-300 flex-shrink-0",
            "hidden md:block", // デスクトップでは常に表示
            sidebarOpen ? "w-80" : "w-16",
          )}
        >
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200",
                  activeTab === item.id
                    ? "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-400 border border-cyan-500/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50",
                )}
                title={sidebarOpen ? "" : item.label} // 閉じたときにツールチップ表示
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">{item.description}</p>
                  </div>
                )}
              </button>
            ))}
          </nav>

          {sidebarOpen && (
            <div className="p-4 mt-auto">
              <Card className="bg-gray-800/50 border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium">システム情報</span>
                </div>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>バージョン:</span>
                    <span className="text-cyan-400">v1.0.1</span>
                  </div>
                  {/* 他の情報もここに追加可能 */}
                </div>
              </Card>
            </div>
          )}
        </aside>

        {/* Mobile Sidebar Overlay - sidebarOpenがtrueでモバイル表示の時 */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <aside className="w-80 bg-[#161926] border-r border-gray-800 p-4">
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id)
                      setSidebarOpen(false) // Close sidebar on mobile after click
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200",
                      activeTab === item.id
                        ? "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-400 border border-cyan-500/30"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50",
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">{item.description}</p>
                    </div>
                  </button>
                ))}
              </nav>
            </aside>
            <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)}></div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>

      {/* Footer */}
      <footer className="bg-[#161926] border-t-2 border-amber-600 dark:border-amber-500 p-4 text-center text-xs text-gray-400 mt-auto">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6">
          <span>© 2025 +Program 管理システム</span>
          <div className="flex gap-2 sm:gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">
              利用規約
            </Link>
            <span className="text-gray-600 hidden sm:inline">|</span>
            <Link href="/privacy" className="hover:text-white transition-colors">
              プライバシーポリシー
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
