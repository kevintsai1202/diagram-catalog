import { CodeCard, CodeMotion, Terminal } from './components/code.ts'
import { Chart, Delta, Gauge, Heatmap, KeyFigures, Progress, Ranking, RegionMap } from './components/data.ts'
import { Decision, Flow, Metaphor, Scatter, Tree } from './components/diagram.ts'
import { Columns, Divider, Report, Section, Slide } from './components/layout.ts'
import { Comparison, DataTable, Figure, SourceList, Timeline } from './components/reference.ts'
import { SocialPost, Stamp, Subscribe } from './components/social.ts'
import { Callout, Checklist, Footnote, Highlights, Paragraph, Quote, Scenes, Steps } from './components/text.ts'
import { SUBSET_KEYWORDS, toSubsetSchema } from './schema.ts'
import { tokens } from './tokens.ts'
import type { CanvasVariantJson, ComponentDef, ComponentJson, When } from './types.ts'
import { LOCALES } from './types.ts'

/**
 * 目錄版本（semver）：刪除或改名 props 升 major；新增元件或選填 props 升 minor；只改說明或關鍵字升 patch。
 * 必須與 package.json 的 version 相同（測試守著）。
 */
export const CATALOG_VERSION = '1.1.0'

/**
 * 全部元件，順序即輸出順序：先是靜態報告渲染器原有的 24 種（維持原順序），再接只有動畫渲染器有的 13 種。
 */
export const COMPONENTS: ComponentDef[] = [
  Report, Section, Columns, Slide, Divider, Paragraph, Callout, Highlights, Quote, Steps, Footnote,
  KeyFigures, Delta, Gauge, Ranking, Progress, Chart, Heatmap, RegionMap, DataTable, Comparison,
  Timeline, Figure, SourceList,
  CodeCard, CodeMotion, Terminal, Tree, Decision, Flow, Scatter, Metaphor, Stamp, SocialPost, Subscribe, Checklist, Scenes,
]

/** 目錄 JSON 的整體形狀。 */
export interface CatalogJson {
  catalogVersion: string
  locales: string[]
  schemaSubset: string[]
  tokens: typeof tokens
  components: Record<string, ComponentJson>
}

/** 把一筆元件定義轉成 JSON（props 轉成 JSON Schema 子集）。 */
function componentToJson(def: ComponentDef): ComponentJson {
  return {
    version: def.version,
    category: def.category,
    name: def.name,
    summary: def.summary,
    aiGuide: def.aiGuide,
    keywords: def.keywords,
    props: toSubsetSchema(def.props),
    renderers: {
      react: { status: def.react.status, component: def.react.component },
      canvas: {
        status: def.canvas.status,
        variants: def.canvas.variants.map((v) => ({
          template: v.template,
          adapter: v.adapter,
          when: v.when,
          steps: v.steps,
          limits: v.limits,
          props: toSubsetSchema(v.props),
        })),
      },
    },
  }
}

/** 由原始碼組出整份目錄（純資料，可直接序列化）。 */
export function buildCatalog(): CatalogJson {
  const ids = new Set<string>()
  for (const c of COMPONENTS) {
    if (ids.has(c.id)) throw new Error(`元件 id 重複：${c.id}`)
    ids.add(c.id)
  }
  return {
    catalogVersion: CATALOG_VERSION,
    locales: [...LOCALES],
    schemaSubset: [...SUBSET_KEYWORDS],
    tokens,
    components: Object.fromEntries(COMPONENTS.map((c) => [c.id, componentToJson(c)])),
  }
}

/** 序列化成 dist/catalog.json 的內容：兩格縮排、LF、結尾換行，同一份原始碼每次輸出相同。 */
export function serializeCatalog(): string {
  return `${JSON.stringify(buildCatalog(), null, 2)}\n`
}

/** 依路徑取欄位值（只支援一般欄位，例如 `kind`、`items`）。 */
function valueAt(props: unknown, path: string): unknown {
  let cur: unknown = props
  for (const key of path.split('.')) {
    if (!cur || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[key]
  }
  return cur
}

/** 判斷一個 `when` 條件是否成立。 */
function matches(when: When, props: unknown): boolean {
  if (when === null) return true
  if ('field' in when) return when.in.includes(String(valueAt(props, when.field)))
  const list = valueAt(props, when.count)
  if (!Array.isArray(list)) return false
  return (when.min === undefined || list.length >= when.min) && (when.max === undefined || list.length <= when.max)
}

/**
 * 為一筆核心 props 選畫布變體：有指定 `requested`（範本 id）就只看那個變體，否則依陣列順序找第一個 `when` 成立的。
 * 找不到（元件不存在、沒有畫布變體、條件都不成立、指定的範本不屬於這個元件）回 null。
 */
export function selectVariant(id: string, props: unknown, requested?: string): CanvasVariantJson | null {
  const def = COMPONENTS.find((c) => c.id === id)
  if (!def) return null
  const variants = componentToJson(def).renderers.canvas.variants
  if (requested !== undefined) return variants.find((v) => v.template === requested) ?? null
  return variants.find((v) => matches(v.when, props)) ?? null
}
