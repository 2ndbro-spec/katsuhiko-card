const STRENGTHS = [
  {
    icon: '💡',
    title: '0→1の発想力',
    desc: '行き詰まった状況を打破する「勝ち筋」を見つけるのが得意。新しいアイデアや切り口を次々と生み出します。',
  },
  {
    icon: '🎯',
    title: '本質思考',
    desc: '表面的な問題ではなく「結局、何が最大の課題なのか？」を深掘り。本質的な解決策にたどり着きます。',
  },
  {
    icon: '🗣️',
    title: '対話による言語化',
    desc: '話しながら思考を整理し、相手の潜在的なニーズを引き出すのが得意。壁打ち相手として最適です。',
  },
]

const TIPS = [
  { icon: '📌', text: '「理由」を共有してください — 背景があれば自分事として動けます' },
  { icon: '🔓', text: '裁量を持たせてください — ゴール共有後にプロセスを任せてもらうと最大パフォーマンス' },
  { icon: '🤝', text: '壁打ちは大歓迎 — 「これどう思う？」という相談が大好物です' },
]

export default function QuickSummary() {
  return (
    <section className="px-4 pb-16 max-w-sm mx-auto">
      {/* Section header */}
      <div className="text-center mb-8">
        <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-2">About</p>
        <h2 className="text-xl font-bold text-white">一言でいうと</h2>
        <p className="mt-3 text-gray-400 text-sm leading-relaxed">
          「新しい可能性を見つけ、<br />仕組みを最適化するのが好きなタイプ」
        </p>
      </div>

      {/* Strengths */}
      <div className="space-y-3 mb-10">
        {STRENGTHS.map((s) => (
          <div
            key={s.title}
            className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{s.icon}</span>
              <h3 className="font-semibold text-white text-sm">{s.title}</h3>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed pl-10">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Collaboration tips */}
      <div>
        <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-4 text-center">
          連携のコツ
        </p>
        <div className="space-y-3">
          {TIPS.map((tip) => (
            <div key={tip.text} className="flex gap-3 items-start">
              <span className="text-lg mt-0.5">{tip.icon}</span>
              <p className="text-gray-400 text-xs leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
