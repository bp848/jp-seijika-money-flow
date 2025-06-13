import Link from "next/link"
import { Github, Twitter } from "lucide-react" // Assuming lucide-react for icons

// Changed from default export to named export
export function Footer() {
  const pages = [
    { href: "/", label: "ホーム" },
    { href: "/explorer", label: "エクスプローラー" },
    { href: "/political-data", label: "政治資金データ" },
    { href: "/vision", label: "ビジョン" },
    { href: "/developer/api-docs", label: "APIドキュメント" },
    { href: "/admin", label: "管理画面" },
  ]

  return (
    <footer className="border-t border-gray-800 bg-[#0d0f17]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              +Program
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              政治資金の透明化を通じて、より開かれた民主主義社会の実現を目指します。
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">リソース</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/developer/api-docs" className="text-gray-300 hover:text-cyan-400 transition-colors">
                  ドキュメント
                </Link>
              </li>
              <li>
                {/* Assuming API reference might be part of docs or a specific page */}
                <Link
                  href="/developer/api-docs#reference"
                  className="text-gray-300 hover:text-cyan-400 transition-colors"
                >
                  API リファレンス
                </Link>
              </li>
              <li>
                {/* Link to where data sources are explained, maybe part of vision or a dedicated page */}
                <Link href="/vision#data-sources" className="text-gray-300 hover:text-cyan-400 transition-colors">
                  データソース
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">プロジェクト</h3>
            <ul className="space-y-2 text-sm">
              <li>
                {/* Placeholder for About Us page if it exists */}
                <Link href="/about" className="text-gray-300 hover:text-cyan-400 transition-colors">
                  チームについて
                </Link>
              </li>
              <li>
                <Link href="/vision" className="text-gray-300 hover:text-cyan-400 transition-colors">
                  ビジョン
                </Link>
              </li>
              <li>
                {/* Placeholder for Partners page if it exists */}
                <Link href="/partners" className="text-gray-300 hover:text-cyan-400 transition-colors">
                  協力団体
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">ページ一覧</h3>
            <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
              {pages.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className="text-gray-300 hover:text-cyan-400 transition-colors">
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">法的情報</h3>
            <ul className="space-y-2 text-sm">
              <li>
                {/* Placeholder for Terms of Service page */}
                <Link href="/terms" className="text-gray-300 hover:text-cyan-400 transition-colors">
                  利用規約
                </Link>
              </li>
              <li>
                {/* Placeholder for Privacy Policy page */}
                <Link href="/privacy" className="text-gray-300 hover:text-cyan-400 transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                {/* Placeholder for Contact page */}
                <Link href="/contact" className="text-gray-300 hover:text-cyan-400 transition-colors">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} +Program. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <p className="text-xs text-gray-500">データは政治資金収支報告書に基づいています。</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
