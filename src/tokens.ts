/**
 * 設計 token：語意名稱與色值。AI 與轉換程式只用語意名稱（primary、flow、warn、bad、ok），
 * 由各渲染器換成色值；模型不寫色碼。
 *
 * - dark：動畫範本的深色預設（底色、卡片、線、文字與強調色）。
 * - light：靜態報告淺色主題的 CSS 變數（oklch）換算成 sRGB hex；card 與 bg 同為白色。
 * - palette：圖表的類別色盤（8 色）。
 */
export const tokens = {
  dark: {
    bg: '#0b1020',
    card: '#141b33',
    line: '#2a3566',
    text: '#eef2ff',
    textMuted: '#9aa4d6',
    primary: '#818cf8',
    flow: '#22d3ee',
    warn: '#fbbf24',
    bad: '#f87171',
    ok: '#34d399',
  },
  light: {
    bg: '#ffffff', // oklch(1 0 0)
    card: '#ffffff', // oklch(1 0 0)
    line: '#e5e5e5', // oklch(0.922 0 0)
    text: '#0a0a0a', // oklch(0.145 0 0)
    textMuted: '#737373', // oklch(0.556 0 0)
    primary: '#504fd5', // oklch(0.51 0.2 277)
    flow: '#0092b0', // oklch(0.6 0.13 215)
    warn: '#d58300', // oklch(0.68 0.16 70)
    bad: '#d73337', // oklch(0.58 0.2 25)
    ok: '#00935d', // oklch(0.58 0.14 160)
  },
  palette: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9', '#8b5cf6', '#ef4444', '#14b8a6'],
}

/** 語意色名。 */
export type TokenName = keyof typeof tokens.dark
