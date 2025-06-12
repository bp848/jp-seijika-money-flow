import type React from "react"
import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Lightbulb, Code, Users, Palette, Handshake } from "lucide-react"

export const metadata: Metadata = {
  title: "+Program | Our Vision",
  description: "The vision behind +Program: Liberating data to update democracy, one line of code at a time.",
}

// Helper component for section with icon
const VisionSection = ({
  icon,
  title,
  children,
}: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <div className="flex items-center mb-4">
      {icon}
      <h2 className="text-2xl font-semibold ml-3">{title}</h2>
    </div>
    <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">{children}</div>
  </div>
)

export default function VisionPage() {
  const titleOptionA = "閉ざされたデータを解放せよ。一行のコードが、民主主義をアップデートする。"
  // const titleOptionB = "+Program: 私たちが目指す、データで対話する社会。";
  // const titleOptionC = "「政治とカネ」は、もうタブーじゃない。";

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-xl overflow-hidden">
          <CardHeader className="bg-gray-100 dark:bg-gray-800 p-8 text-center">
            <div className="flex justify-center mb-4">
              <Lightbulb className="w-16 h-16 text-yellow-500" />
            </div>
            <CardTitle className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {titleOptionA}
            </CardTitle>
            <CardDescription className="mt-4 text-xl text-gray-600 dark:text-gray-400">
              +Program: データとテクノロジーで、より透明な社会をプログラミングする。
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 md:p-12">
            <VisionSection
              icon={<Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
              title="私たちの社会と「なぜ」この挑戦を始めたのか"
            >
              <p>
                私たちの社会には、無数の「ブラックボックス」が存在します。
                特に、私たちの暮らしに最も大きな影響を与える「政治」の世界は、複雑で、不透明で、どこか遠い存在です。
              </p>
              <p>
                中でも「政治とカネ」の問題は、ニュースで繰り返し報じられながらも、その全体像を私たち市民が理解することは、これまで不可能に近いことでした。何百ページにも及ぶPDFの収支報告書、分断されたデータベース、そして、その情報の流れを追うことのできない「行き止まり」のデータ。
              </p>
              <p>
                私は、一人の市民として、そして一人の開発者として、この現状に強い疑問を抱きました。
                なぜ、最も公開されるべき情報が、最もアクセスしにくい形で眠っているのか？
                なぜ、テクノロジーがこれほど進化した現代において、私たちは未だにデータの迷路で立ち尽くさなければならないのか？
              </p>
              <p>
                この不透明な壁を、プログラムの力で破壊できないか。 その純粋な怒りと好奇心が、
                <strong>「+Program」</strong>の原点です。
              </p>
            </VisionSection>

            <Separator className="my-10" />

            <VisionSection
              icon={<Code className="w-8 h-8 text-green-600 dark:text-green-400" />}
              title="私たちの解決策：「何をするのか」"
            >
              <p>
                <code>+Program</code>
                は、レガシーな社会システムにテクノロジーを「プラス」することで、その価値を根本から変容させる試みです。
              </p>
              <p>
                その第一弾<strong>「政治資金 + Program」</strong>では、私たちは3つの革命を起こします。
              </p>
              <ol>
                <li>
                  <strong>「見るだけ」から「使える」データへ。</strong>
                  <br />
                  私たちは、AI（Document
                  AI）を用いて難解な収支報告書を構造化し、オープンなAPIとして解放します。これにより、データはジャーナリスト、研究者、そしてすべての市民が自由に分析・活用できる「公共財」となります。
                </li>
                <li>
                  <strong>「行き止まり」から「無限の探索」へ。</strong>
                  <br />
                  私たちは、ブロックチェーンエクスプローラーにインスパイアされた、直感的なUIを開発します。政治家、政党、企業、団体…すべてのエンティティが相互にリンクされ、ユーザーは金の流れ（フロー）をどこまでも追跡できます。「企業と政治家の癒着」は、もはや隠された疑惑ではなく、誰もが確認できる「関係性のネットワーク」として可視化されます。
                </li>
                <li>
                  <strong>「検索」から「対話」へ。</strong>
                  <br />
                  私たちは、LangChainを用いたAIチャット機能を統合します。これにより、誰もが自然言語で「〇〇大臣の最大の献金企業は？」と問いかけるだけで、データと直接「対話」できるようになります。専門知識は、もはや必要ありません。必要なのは、真実を知りたいという純粋な好奇心だけです。
                </li>
              </ol>
            </VisionSection>

            <Separator className="my-10" />

            <VisionSection
              icon={<Palette className="w-8 h-8 text-purple-600 dark:text-purple-400" />}
              title="私たちの真の目的と未来：「どこへ向かうのか」"
            >
              <p>しかし、私たちの挑戦は、単に便利なツールを作ることではありません。</p>
              <p>
                私たちは、このプロセスで生まれた技術、すなわち
                <strong>「あらゆる文書を学習し、対話可能な知識へと変換するAIツール」</strong>
                そのものも、オープンソースとして社会に公開します。
              </p>
              <p>
                これは、あなたが、あなたの手で、あらゆる情報を民主化するための武器です。
                自治体の議事録を、企業の財務諸表を、裁判の判例を、あなた自身の「対話AI」にすることができるのです。
              </p>
              <p>
                そして、このプロジェクトの最終的なアウトプットは、もう一つあります。
                それは、この社会の深層を流れる「カネ」と「情報」のデータを、音と光に変換する
                <strong>「社会的プログラミングアート」</strong>
                です。データが奏でるアンビエントな環境の中で、私たちは社会を論理ではなく、感性で捉え直す。そんな新しい体験を創造します。
              </p>
            </VisionSection>

            <Separator className="my-10" />

            <VisionSection
              icon={<Handshake className="w-8 h-8 text-red-600 dark:text-red-400" />}
              title="私たちの呼びかけ"
            >
              <p>
                <code>+Program</code>は、一個人の挑戦から始まりました。
                しかし、このビジョンは、もはや私一人のものではありません。
              </p>
              <p>
                より透明で、より公正で、より知的な社会を望む、すべての人々のためのものです。
                閉ざされたデータを解放し、テクノロジーの力で民主主義をアップデートする。
              </p>
              <p>この壮大な旅に、どうかあなたの力を貸してください。 一緒に、未来をプログラミングしましょう。</p>
            </VisionSection>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
