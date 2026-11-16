import type { z } from 'zod'

/** 目錄支援的語言（順序即輸出順序）。 */
export const LOCALES = ['zh-TW', 'en', 'ja'] as const
export type Locale = (typeof LOCALES)[number]

/** 三語文字。 */
export type I18n = Record<Locale, string>
/** 三語關鍵字清單。 */
export type I18nList = Record<Locale, string[]>

/** 渲染器對某個元件的支援程度：full 一對一、partial 會掉資訊或受上限限制、none 不支援。 */
export type Status = 'full' | 'partial' | 'none'

/** 元件分類（給挑選與介面分組用）。 */
export type Category =
  | 'layout'
  | 'text'
  | 'number'
  | 'chart'
  | 'table'
  | 'compare'
  | 'sequence'
  | 'media'
  | 'code'
  | 'structure'
  | 'social'

/**
 * 畫布變體的上限。鍵是欄位路徑：`a.b` 是巢狀欄位，`items[]` 是陣列的每一項，`*` 是任一欄位。
 * 一般關鍵字與 JSON Schema 同義；`maxNodes`／`maxDepth`／`maxChildren` 用在遞迴的樹狀欄位（整棵樹的節點數、層數、每個節點的子節點數）。
 */
export interface Limit {
  minLength?: number
  maxLength?: number
  minItems?: number
  maxItems?: number
  minimum?: number
  maximum?: number
  maxNodes?: number
  maxDepth?: number
  maxChildren?: number
}

/**
 * 變體的選擇條件，只看欄位值與項目數，不寫程式：
 * - `null`：一定符合（預設變體，放在陣列最後）；
 * - `{ field, in }`：欄位值在清單內；
 * - `{ count, min, max }`：陣列欄位的項目數在範圍內（含端點）。
 * 依陣列順序找第一個符合的變體。
 */
export type When = null | { field: string; in: string[] } | { count: string; min?: number; max?: number }

/** 步驟語意：第 i 步做什麼（三語），以及最多幾步（決定需要幾個時間點）。 */
export type Steps = I18n & { max: number }

/** 一個畫布變體：對到哪個動畫範本、用哪支轉換程式、上限與只有畫布才有的額外欄位。 */
export interface CanvasVariant {
  template: string
  adapter: string
  when: When
  steps: Steps
  limits: Record<string, Limit>
  /** 畫布擴充欄位（不含核心欄位）；沒有額外欄位時給空物件。 */
  props: z.ZodObject
}

/** 一筆元件定義（原始碼裡的形狀；props 仍是 zod 物件）。 */
export interface ComponentDef {
  id: string
  version: number
  category: Category
  name: I18n
  summary: I18n
  aiGuide: I18n
  keywords: I18nList
  /** 核心 props：兩種渲染器都成立的語意與形狀，不含任何渲染器的上限。 */
  props: z.ZodObject
  react: { status: Status; component: string | null }
  canvas: { status: Status; variants: CanvasVariant[] }
}

/** 輸出到 JSON 的 JSON Schema 子集（型別寬鬆描述）。 */
export interface JsonSchema {
  type?: string | string[]
  properties?: Record<string, JsonSchema>
  required?: string[]
  items?: JsonSchema
  [key: string]: unknown
}

/** 輸出到 JSON 的變體。 */
export interface CanvasVariantJson extends Omit<CanvasVariant, 'props'> {
  props: JsonSchema
}

/** 輸出到 JSON 的一筆元件。 */
export interface ComponentJson {
  version: number
  category: Category
  name: I18n
  summary: I18n
  aiGuide: I18n
  keywords: I18nList
  props: JsonSchema
  renderers: {
    react: { status: Status; component: string | null }
    canvas: { status: Status; variants: CanvasVariantJson[] }
  }
}

/** 定義元件的輔助函式（只為了型別檢查，原樣回傳）。 */
export function defineComponent(def: ComponentDef): ComponentDef {
  return def
}

/** 三語文字的簡寫。 */
export function t(zhTW: string, en: string, ja: string): I18n {
  return { 'zh-TW': zhTW, en, ja }
}

/** 三語關鍵字的簡寫。 */
export function kw(zhTW: string[], en: string[], ja: string[]): I18nList {
  return { 'zh-TW': zhTW, en, ja }
}

/** 步驟語意的簡寫。 */
export function steps(max: number, zhTW: string, en: string, ja: string): Steps {
  return { 'zh-TW': zhTW, en, ja, max }
}
