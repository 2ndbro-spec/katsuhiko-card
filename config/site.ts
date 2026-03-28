// SNS設定ファイル
// 表示したいSNSのコメントアウトを外し、URLを入力してください

export type SnsId = 'instagram' | 'x' | 'facebook' | 'linkedin' | 'tiktok' | 'line'

export interface SnsLink {
  id: SnsId
  label: string
  url: string
  color: string
}

// ここにURLを入力し、表示させたいSNSのコメントを外してください
const SNS_CONFIG: SnsLink[] = [
  // {
  //   id: 'instagram',
  //   label: 'Instagram',
  //   url: 'https://instagram.com/your_handle',
  //   color: '#E1306C',
  // },
  // {
  //   id: 'x',
  //   label: 'X (Twitter)',
  //   url: 'https://x.com/your_handle',
  //   color: '#ffffff',
  // },
  // {
  //   id: 'facebook',
  //   label: 'Facebook',
  //   url: 'https://facebook.com/your_handle',
  //   color: '#1877F2',
  // },
  // {
  //   id: 'linkedin',
  //   label: 'LinkedIn',
  //   url: 'https://linkedin.com/in/your_handle',
  //   color: '#0A66C2',
  // },
  // {
  //   id: 'tiktok',
  //   label: 'TikTok',
  //   url: 'https://tiktok.com/@your_handle',
  //   color: '#ffffff',
  // },
  // {
  //   id: 'line',
  //   label: 'LINE',
  //   url: 'https://line.me/ti/p/your_id',
  //   color: '#06C755',
  // },
]

export const ACTIVE_SNS = SNS_CONFIG.filter(s => s.url !== '')

export const SITE_CONFIG = {
  name: '田中 克彦',
  nameEn: 'Katsuhiko Tanaka',
  title: 'コンセプト設計 / ビジネスアーキテクト',
  timerexUrl: 'https://timerex.net/s/ktanaka.denno_ec00/e0d6043a',
  phone: '070-8566-3534',
  email: 'tanaka@dennoworks.com',
}
