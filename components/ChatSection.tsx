'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { SITE_CONFIG } from '@/config/site'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_QUESTIONS = [
  '得意なプロジェクトは？',
  'どんな人と組むのが好き？',
  '壁打ちをお願いしたい',
  '仕事を依頼したい',
]

function parseContent(text: string) {
  // Convert markdown links [text](url) to anchor tags
  const parts = text.split(/(\[.*?\]\(.*?\))/g)
  return parts.map((part, i) => {
    const match = part.match(/\[(.*?)\]\((.*?)\)/)
    if (match) {
      return (
        <a
          key={i}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline underline-offset-2"
        >
          {match[1]}
        </a>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export default function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'こんにちは！田中克彦の秘書AIです。田中についてどんなことでもお気軽にどうぞ。',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(content: string) {
    if (!content.trim() || isLoading) return

    const newMessages: Message[] = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.content }])
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: '申し訳ありません、エラーが発生しました。しばらくしてからもう一度お試しください。' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="pb-4 max-w-sm mx-auto">
      {/* Section header */}
      <div className="text-center mb-6 px-4">
        <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-2">AI Secretary</p>
        <h2 className="text-xl font-bold text-white">克彦の秘書に話しかける</h2>
        <p className="mt-2 text-gray-500 text-xs">会話は保存されません</p>
      </div>

      {/* Chat container */}
      <div className="mx-4 bg-[#1a1a1a] border border-[#2e2e2e] rounded-3xl overflow-hidden">
        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-3 chat-scroll">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white mr-2 mt-auto shrink-0">
                  秘
                </div>
              )}
              <div
                className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-[#242424] text-gray-200 rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' ? parseContent(msg.content) : msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white mr-2 shrink-0">
                秘
              </div>
              <div className="bg-[#242424] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions */}
        <div className="px-3 pb-2 flex gap-2 overflow-x-auto">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-[#2e2e2e] text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-colors whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-[#2e2e2e] flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="メッセージを入力..."
            className="flex-1 bg-[#242424] text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-600"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* TimeRex CTA */}
      <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-blue-950/50 to-blue-900/30 border border-blue-800/40 rounded-2xl text-center">
        <p className="text-sm text-gray-300 mb-3">直接話してみませんか？</p>
        <a
          href={SITE_CONFIG.timerexUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          30分の面談を予約する
        </a>
      </div>
    </section>
  )
}
