"use client"

import { motion } from "framer-motion"

export function AboutSection() {
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
          私たちのビジョン
        </h2>
        <motion.p
          className="mx-auto mt-6 max-w-3xl text-gray-300 leading-relaxed text-base md:text-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          私たちは、テクノロジーの力で政治の透明性を根底から変革できると信じています。複雑で不透明な政治資金の流れを、誰もが直感的に理解し、対話し、分析できるプラットフォームを提供することで、より健全で開かれた民主主義の実現を目指します。
        </motion.p>

        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <motion.div
            className="bg-[#161926] p-4 md:p-6 rounded-xl border border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -5 }}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-cyan-400 md:w-6 md:h-6"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">透明性の向上</h3>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              政治資金の流れを可視化し、誰もがアクセスできる形で提供します。
            </p>
          </motion.div>

          <motion.div
            className="bg-[#161926] p-4 md:p-6 rounded-xl border border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -5 }}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-purple-400 md:w-6 md:h-6"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <path d="M16 13H8"></path>
                <path d="M16 17H8"></path>
                <path d="M10 9H8"></path>
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">データ民主化</h3>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              専門知識がなくても、誰もが政治資金データを分析・理解できるようにします。
            </p>
          </motion.div>

          <motion.div
            className="bg-[#161926] p-4 md:p-6 rounded-xl border border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -5 }}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-400 md:w-6 md:h-6"
              >
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">市民参加の促進</h3>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              情報へのアクセスを容易にすることで、より多くの市民の政治参加を促します。
            </p>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
