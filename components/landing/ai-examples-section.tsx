"use client"

import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

const exampleQuestions = [
  "この1年で最も献金を受けた政治家は？",
  "特定企業からの献金推移をグラフで表示して。",
  "政党別の資金総額を比較してください。",
  "〇〇業界から最も献金を受けている議員は誰？",
  "過去5年間の献金額の増減が大きい政治家は？",
  "匿名での献金総額はいくら？",
  "特定の政治家への寄付者一覧を教えて。",
  "今年の献金額が急増した企業を教えて。",
  "政党ごとの資金の使い道の内訳を表示して。",
]

export function AiExamplesSection() {
  return (
    <motion.section
      className="py-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          AIに聞いてみよう
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-gray-300 text-sm md:text-base leading-relaxed">
          自然な言葉で質問するだけで、AIが膨大な政治資金データから答えを導き出します。まずは下記の質問例を試してみましょう。
        </p>
        <div className="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {exampleQuestions.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="flex flex-col justify-between text-left bg-[#161926] border-gray-800 overflow-hidden h-full">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg text-gray-100 leading-relaxed">{q}</CardTitle>
                </CardHeader>
                <CardFooter className="border-t border-gray-800 bg-[#0f111a]/50 p-3 md:p-4">
                  <Button
                    variant="outline"
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0 transition-all duration-300 text-sm"
                  >
                    この質問を試す
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
