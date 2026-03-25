import HeroSection from '@/components/HeroSection'
import QuickSummary from '@/components/QuickSummary'
import ChatSection from '@/components/ChatSection'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] max-w-md mx-auto">
      <HeroSection />
      <QuickSummary />
      <ChatSection />
      <footer className="text-center py-8 text-gray-700 text-xs">
        © 2025 田中 克彦
      </footer>
    </main>
  )
}
