import { Landmark, Github } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="relative flex items-center justify-between p-3 border-b bg-white dark:bg-gray-950 z-10 shadow-sm">
      {/* 左側のロゴ */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <Landmark className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">政治資金エクスプローラー</h1>
        </Link>
      </div>

      {/* 中央のナビゲーション */}
      <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-6">
        <Link href="/political-data" className="text-sm font-medium hover:text-primary transition-colors">
          資金の流れを見る
        </Link>
        <Link href="/docs" className="text-sm font-medium hover:text-primary transition-colors">
          APIドキュメント
        </Link>
      </nav>

      {/* 右側のボタンエリア */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border-r pr-4 mr-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">開発者ログイン</span>
          <Button variant="outline" size="icon" aria-label="GitHub login">
            <Github className="h-4 w-4" />
          </Button>
          <Button variant="outline" aria-label="Google login">
            {/* As there's no standard Google icon in Lucide, we use text or a custom SVG */}
            <span className="font-bold">G</span>
          </Button>
        </div>
        <Button asChild>
          <Link href="/admin">管理画面</Link>
        </Button>
      </div>
    </header>
  )
}
