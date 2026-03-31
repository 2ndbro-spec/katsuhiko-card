import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { BASE_SYSTEM_PROMPT, buildSystemPrompt } from '@/lib/system-prompt'
import { fetchAllEntries } from '@/lib/knowledge'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    let systemPrompt = BASE_SYSTEM_PROMPT
    try {
      const entries = await fetchAllEntries()
      systemPrompt = buildSystemPrompt(entries)
    } catch {
      // Supabase unavailable — fall back to base prompt
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    })

    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }))

    const safeHistory = history[0]?.role === 'model' ? history.slice(1) : history
    const chat = model.startChat({ history: safeHistory })
    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    const text = result.response.text()

    return NextResponse.json({ content: text })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}
