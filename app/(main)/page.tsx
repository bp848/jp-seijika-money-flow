"use client"

import { useState } from "react"
import { HeroSection } from "@/components/landing/hero-section"
import { SearchSection } from "@/components/landing/search-section"
import { VisualizerSection } from "@/components/landing/visualizer-section"
import { AboutSection } from "@/components/landing/about-section"
import { ApiSection } from "@/components/landing/api-section"
import { AiExamplesSection } from "@/components/landing/ai-examples-section"
import ChatPanel from "@/components/landing/chat-panel"

export default function LandingPage() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  const handleChatToggle = () => {
    setIsChatOpen((prev) => !prev)
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1">
        <HeroSection onChatToggle={handleChatToggle} />
        <AboutSection />
        <SearchSection />
        <VisualizerSection />
        <AiExamplesSection />
        <ApiSection />
      </main>
      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  )
}
