"use client"

import { CheckCircle, Code, Key, Shield, Zap, Database, FileText, Users, Github, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

const apiFeatures = [
  {
    icon: Zap,
    title: "リアルタイムデータ提供",
    description: "政治資金収支報告書の公開データを常に最新の状態で反映。24/7安定稼働の高可用性インフラで提供。",
  },
  {
    icon: Database,
    title: "柔軟で強力なクエリ機能",
    description:
      "期間、政治家、政党、業界、寄付元企業など多彩なクエリパラメータ。ページネーション・ソート・フィルタリング完全対応。",
  },
  {
    icon: Code,
    title: "RESTful API設計",
    description: "OpenAPI/Swagger形式の充実したドキュメント。curl、Python、JavaScript等のサンプルコード完備。",
  },
  {
    icon: Shield,
    title: "エンタープライズレベルのセキュリティ",
    description: "HTTPS通信、APIキー認証、利用制限・権限管理。SOC2準拠のセキュアなインフラで運用。",
  },
]

const apiSteps = [
  {
    step: "01",
    title: "APIキー発行・管理",
    description: "ユーザー登録後、ダッシュボードからAPIキーを取得。キーの発行・再発行・権限管理も簡単操作。",
  },
  {
    step: "02",
    title: "ドキュメント・試験環境",
    description: "Swagger UIでインタラクティブにAPI試行可能。充実したドキュメントとサンドボックス環境を提供。",
  },
  {
    step: "03",
    title: "本格運用・サポート",
    description: "プロダクション環境での利用開始。技術サポートやSlackコミュニティでの開発者支援も完備。",
  },
]

// Changed from 'export default function ApiSection()'
export function ApiSection() {
  return (
    <motion.section
      className="py-20 bg-[#0d0f17]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            開発者・研究者のための政治資金データAPI
          </motion.h2>
          <motion.p
            className="mx-auto max-w-3xl text-gray-300 text-sm md:text-base leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            リアルタイムデータ、柔軟なクエリ、セキュアなAPIキー管理で、開発と研究を加速します。
            <br />
            エンタープライズレベルの信頼性で、あらゆる規模のプロジェクトに対応。
          </motion.p>
        </div>

        {/* Open Source & Licensing Banner */}
        <motion.div
          className="mb-16 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 rounded-xl border border-gray-800 p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-600/20 flex items-center justify-center">
                <Github className="h-8 w-8 text-cyan-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-100 mb-2">100%オープンソース</h3>
              <p className="text-gray-300 leading-relaxed">
                このシステムは完全にオープンソースで、MITライセンスの下で公開されています。セルフホストすれば誰でも自由に改変、再配布、商用利用が可能です。私たちは透明性と協力を重視し、コミュニティの貢献を歓迎します。
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <Button
                  className="bg-[#161926] hover:bg-gray-800 text-gray-300 border border-gray-700 hover:border-cyan-400 hover:text-cyan-400"
                  size="sm"
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHubリポジトリを見る
                </Button>
                <Button
                  className="bg-[#161926] hover:bg-gray-800 text-gray-300 border border-gray-700 hover:border-cyan-400 hover:text-cyan-400"
                  size="sm"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  セルフホストガイド
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* API Flow Steps */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-xl md:text-2xl font-bold text-center mb-8 text-gray-100">🚀 API利用の流れ</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {apiSteps.map((step, i) => (
              <motion.div
                key={i}
                className="relative bg-[#161926] p-6 rounded-xl border border-gray-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="absolute -top-4 left-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {step.step}
                  </div>
                </div>
                <h4 className="font-bold text-gray-100 mb-3 mt-2">{step.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technical Features */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-xl md:text-2xl font-bold text-center mb-8 text-gray-100">⚡ 技術的特徴</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {apiFeatures.map((feature, i) => (
              <motion.div
                key={i}
                className="flex gap-4 p-6 bg-[#161926] rounded-xl border border-gray-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-600/20 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-100 mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Code Examples */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-xl md:text-2xl font-bold text-center mb-8 text-gray-100">💻 実装例</h3>

          <div className="space-y-6">
            {/* cURL Example */}
            <div className="rounded-xl border border-gray-800 bg-[#161926] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#0f111a]/50">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-sm text-gray-400 font-mono">cURL</span>
                </div>
                <span className="text-xs text-gray-500">政治家別献金トップ5取得</span>
              </div>
              <pre className="p-4 text-sm overflow-x-auto">
                <code className="text-gray-300 font-mono">
                  <span className="text-cyan-400">curl</span> <span className="text-yellow-400">-H</span>{" "}
                  <span className="text-green-400">"Authorization: Bearer YOUR_API_KEY"</span> \<br />
                  {"  "}
                  <span className="text-purple-400">"https://api.plusprogram.jp/v1/politicians/top-donations"</span> \
                  <br />
                  {"  "}
                  <span className="text-yellow-400">-G</span> <span className="text-yellow-400">-d</span>{" "}
                  <span className="text-green-400">"year=2024"</span> \<br />
                  {"  "}
                  <span className="text-yellow-400">-d</span> <span className="text-green-400">"limit=5"</span> \<br />
                  {"  "}
                  <span className="text-yellow-400">-d</span>{" "}
                  <span className="text-green-400">"industry=technology"</span>
                </code>
              </pre>
            </div>

            {/* Python Example */}
            <div className="rounded-xl border border-gray-800 bg-[#161926] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#0f111a]/50">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-sm text-gray-400 font-mono">Python</span>
                </div>
                <span className="text-xs text-gray-500">requests ライブラリ使用</span>
              </div>
              <pre className="p-4 text-sm overflow-x-auto">
                <code className="text-gray-300 font-mono">
                  <span className="text-purple-400">import</span> <span className="text-cyan-400">requests</span>
                  <br />
                  <br />
                  <span className="text-gray-500"># APIキーとエンドポイント設定</span>
                  <br />
                  <span className="text-yellow-400">headers</span> = {'{"Authorization": "Bearer YOUR_API_KEY"}'}
                  <br />
                  <span className="text-yellow-400">params</span> = {"{"}
                  <br />
                  {"    "}
                  <span className="text-green-400">"year"</span>: <span className="text-orange-400">2024</span>,<br />
                  {"    "}
                  <span className="text-green-400">"limit"</span>: <span className="text-orange-400">5</span>,<br />
                  {"    "}
                  <span className="text-green-400">"industry"</span>:{" "}
                  <span className="text-green-400">"technology"</span>
                  <br />
                  {"}"}
                  <br />
                  <br />
                  <span className="text-gray-500"># API呼び出し</span>
                  <br />
                  <span className="text-yellow-400">response</span> = <span className="text-cyan-400">requests</span>.
                  <span className="text-blue-400">get</span>(<br />
                  {"    "}
                  <span className="text-green-400">"https://api.plusprogram.jp/v1/politicians/top-donations"</span>,
                  <br />
                  {"    "}
                  <span className="text-yellow-400">headers</span>=<span className="text-yellow-400">headers</span>,
                  <br />
                  {"    "}
                  <span className="text-yellow-400">params</span>=<span className="text-yellow-400">params</span>
                  <br />
                  )<br />
                  <br />
                  <span className="text-purple-400">print</span>(<span className="text-yellow-400">response</span>.
                  <span className="text-blue-400">json</span>())
                </code>
              </pre>
            </div>

            {/* Response Example */}
            <div className="rounded-xl border border-gray-800 bg-[#161926] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#0f111a]/50">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-sm text-gray-400 font-mono">JSON Response</span>
                </div>
                <span className="text-xs text-gray-500">レスポンス例</span>
              </div>
              <pre className="p-4 text-sm overflow-x-auto">
                <code className="text-gray-300 font-mono">
                  {`{
  "status": "success",
  "data": [
    {
      "politician": "山田太郎",
      "party": "未来党",
      "total_amount": 75000000,
      "donation_count": 12,
      "top_donor": "テクノ株式会社",
      "top_donation_amount": 15000000,
      "period": "2024-01-01 to 2024-12-31"
    },
    {
      "politician": "佐藤花子",
      "party": "革新党",
      "total_amount": 68000000,
      "donation_count": 8,
      "top_donor": "デジタル・イノベーション株式会社",
      "top_donation_amount": 20000000,
      "period": "2024-01-01 to 2024-12-31"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 1,
    "total_count": 2,
    "limit": 5
  },
  "meta": {
    "query_time": "0.045s",
    "last_updated": "2024-12-09T10:30:00Z"
  }
}`}
                </code>
              </pre>
            </div>
          </div>
        </motion.div>

        {/* Pricing & Support Banner */}
        <motion.div
          className="mb-16 bg-gradient-to-r from-purple-600/10 to-cyan-500/10 rounded-xl border border-gray-800 p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600/20 to-cyan-500/20 flex items-center justify-center">
                <Heart className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-100 mb-2">利用料金とプロジェクト支援</h3>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-cyan-400">個人利用・研究・教育目的</strong>
                での利用は<strong className="text-cyan-400">完全無料</strong>
                です。商用利用の場合は、インフラコスト負担のため有料プランをご検討ください。
                <br />
                また、このシステムのインフラやAI機能の維持・開発費用は
                <strong className="text-purple-400">クラウドファンディング</strong>
                で支援を募っています。透明な政治のために、ぜひご支援をお願いします。
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white">
                  <Heart className="mr-2 h-4 w-4" />
                  プロジェクトを支援する
                </Button>
                <Button className="bg-[#161926] hover:bg-gray-800 text-gray-300 border border-gray-700 hover:border-cyan-400 hover:text-cyan-400">
                  <FileText className="mr-2 h-4 w-4" />
                  料金プランを見る
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional Features */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-[#161926] rounded-xl border border-gray-800">
              <Key className="h-8 w-8 text-cyan-400 mx-auto mb-4" />
              <h4 className="font-bold text-gray-100 mb-2">APIキー管理</h4>
              <p className="text-sm text-gray-400">ダッシュボードで簡単管理。利用制限・権限設定も柔軟に対応。</p>
            </div>
            <div className="text-center p-6 bg-[#161926] rounded-xl border border-gray-800">
              <FileText className="h-8 w-8 text-purple-400 mx-auto mb-4" />
              <h4 className="font-bold text-gray-100 mb-2">充実ドキュメント</h4>
              <p className="text-sm text-gray-400">OpenAPI準拠。Swagger UIでインタラクティブに試行可能。</p>
            </div>
            <div className="text-center p-6 bg-[#161926] rounded-xl border border-gray-800">
              <Users className="h-8 w-8 text-emerald-400 mx-auto mb-4" />
              <h4 className="font-bold text-gray-100 mb-2">開発者サポート</h4>
              <p className="text-sm text-gray-400">Slackコミュニティ・技術サポートで開発を全面支援。</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="space-y-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 text-lg px-8 py-4 rounded-xl mr-4"
              >
                <Code className="mr-2 h-5 w-5" />
                無料APIキーを今すぐ発行
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-[#161926] border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-cyan-400 hover:border-cyan-400 transition-all duration-300 text-lg px-8 py-4 rounded-xl"
              >
                <FileText className="mr-2 h-5 w-5" />
                APIドキュメントを見る
              </Button>
            </motion.div>

            <motion.p
              className="text-center text-gray-300 leading-relaxed max-w-3xl mx-auto text-sm md:text-base"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              🚀 <strong>無料トライアル</strong>で今すぐ開始。個人利用は無制限、商用利用は月間10,000リクエストまで無料。
              <br />
              政治資金の透明化は社会の健全化につながります。ぜひこのデータを活用し、新たな発見や洞察を生み出してください。
            </motion.p>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-400" />
                クレジットカード不要
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-400" />
                即座に利用開始
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-400" />
                24/7技術サポート
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
