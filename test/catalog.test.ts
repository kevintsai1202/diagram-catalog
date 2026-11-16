import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  buildCatalog,
  CATALOG_VERSION,
  COMPONENTS,
  core,
  LOCALES,
  selectVariant,
  serializeCatalog,
  SUBSET_KEYWORDS,
} from '../src/index.ts'
import { INVALID, VALID } from './samples.ts'

const here = dirname(fileURLToPath(import.meta.url))

/** 來自靜態報告渲染器的 24 種元件（順序即目錄順序）。 */
const REPORT_IDS = [
  'Report', 'Section', 'Columns', 'Slide', 'Divider', 'Paragraph', 'Callout', 'Highlights', 'Quote', 'Steps', 'Footnote',
  'KeyFigures', 'Delta', 'Gauge', 'Ranking', 'Progress', 'Chart', 'Heatmap', 'RegionMap', 'DataTable', 'Comparison',
  'Timeline', 'Figure', 'SourceList',
]
/** 只有動畫渲染器有的 12 種。 */
const CANVAS_ONLY_IDS = [
  'CodeCard', 'CodeMotion', 'Terminal', 'Tree', 'Decision', 'Flow', 'Scatter', 'Metaphor', 'Stamp', 'SocialPost', 'Subscribe', 'Checklist',
]
/** 動畫渲染器的 23 個圖解範本 id。 */
const CANVAS_TEMPLATES = [
  'diagram-pipeline', 'diagram-compare', 'diagram-image-focus', 'diagram-code', 'diagram-audit-table', 'diagram-bar-chart',
  'diagram-stamp', 'diagram-curve-chart', 'diagram-tree', 'diagram-scenes', 'diagram-flow', 'diagram-scatter',
  'diagram-metaphor', 'diagram-code-motion', 'diagram-terminal', 'diagram-countup', 'diagram-pills', 'diagram-text-highlight',
  'diagram-decision', 'diagram-checklist', 'diagram-timeline', 'diagram-social-post', 'diagram-subscribe',
]
/** 沒有畫布變體的元件：容器、樣板用的版面元件，以及目前的缺口。 */
const CANVAS_NONE = ['Report', 'Columns', 'Divider', 'Footnote', 'SourceList', 'Callout', 'Delta', 'Heatmap', 'RegionMap']

/**
 * 核心 props 的鍵與順序。共用核心沿用靜態報告渲染器原本的形狀，
 * 只拿掉引用欄位 `source` 與報告根節點的 template／templateName（由各產品自行擴充）。
 */
const CORE_KEYS: Record<string, string[]> = {
  Report: ['title', 'summary'],
  Section: ['title'],
  Columns: ['count'],
  Slide: ['title', 'layout', 'transition'],
  Divider: [],
  Paragraph: ['text'],
  Callout: ['tone', 'text'],
  Highlights: ['items'],
  Quote: ['text'],
  Steps: ['items'],
  Footnote: ['text'],
  KeyFigures: ['items'],
  Delta: ['label', 'before', 'after', 'unit'],
  Gauge: ['label', 'value', 'max', 'unit'],
  Ranking: ['title', 'unit', 'items'],
  Progress: ['title', 'unit', 'max', 'items'],
  Chart: ['title', 'kind', 'unit', 'categories', 'series'],
  Heatmap: ['title', 'unit', 'rows', 'columns', 'values'],
  RegionMap: ['title', 'unit', 'items'],
  DataTable: ['title', 'columns', 'rows'],
  Comparison: ['left', 'right'],
  Timeline: ['items'],
  Figure: ['caption'],
  SourceList: [],
}

const catalog = buildCatalog()
const entries = Object.entries(catalog.components)

/** 走訪 JSON Schema，收集所有出現過的關鍵字。 */
function collectKeywords(node: unknown, out: Set<string>): void {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    for (const n of node) collectKeywords(n, out)
    return
  }
  for (const [k, v] of Object.entries(node)) {
    out.add(k)
    if (k === 'properties' || k === '$defs') {
      for (const child of Object.values(v as object)) collectKeywords(child, out)
    } else if (k === 'items') {
      collectKeywords(v, out)
    }
  }
}

describe('元件清單', () => {
  it('共 36 個 id：靜態報告的 24 種在前，動畫專有的 12 種在後', () => {
    expect(Object.keys(catalog.components)).toEqual([...REPORT_IDS, ...CANVAS_ONLY_IDS])
    expect(COMPONENTS).toHaveLength(36)
  })

  it('每個元件的名稱、摘要、AI 用法、關鍵字三語都有內容', () => {
    expect(LOCALES).toEqual(['zh-TW', 'en', 'ja'])
    for (const [id, c] of entries) {
      for (const lang of LOCALES) {
        expect(c.name[lang]?.trim(), `${id}.name.${lang}`).toBeTruthy()
        expect(c.summary[lang]?.trim(), `${id}.summary.${lang}`).toBeTruthy()
        expect(c.aiGuide[lang]?.trim(), `${id}.aiGuide.${lang}`).toBeTruthy()
        expect(c.keywords[lang]?.length, `${id}.keywords.${lang}`).toBeGreaterThan(0)
        for (const k of c.keywords[lang]) expect(k.trim(), `${id}.keywords.${lang}`).toBeTruthy()
      }
      expect(Number.isInteger(c.version) && c.version >= 1, id).toBe(true)
    }
  })

  it('靜態報告渲染器：24 種都是 full，動畫專有的 12 種是 none', () => {
    for (const id of REPORT_IDS) expect(catalog.components[id].renderers.react, id).toEqual({ status: 'full', component: id })
    for (const id of CANVAS_ONLY_IDS) expect(catalog.components[id].renderers.react, id).toEqual({ status: 'none', component: null })
  })

  it('沒有畫布對應的元件標成 none 且沒有變體；其餘至少一個變體', () => {
    for (const [id, c] of entries) {
      const canvas = c.renderers.canvas
      if (CANVAS_NONE.includes(id)) {
        expect(canvas, id).toEqual({ status: 'none', variants: [] })
      } else {
        expect(canvas.status, id).not.toBe('none')
        expect(canvas.variants.length, id).toBeGreaterThan(0)
      }
    }
  })

  it('23 個圖解範本每個至少被一個變體引用，也沒有引用範圍外的範本', () => {
    const used = new Set(entries.flatMap(([, c]) => c.renderers.canvas.variants.map((v) => v.template)))
    expect([...used].sort()).toEqual([...CANVAS_TEMPLATES].sort())
  })
})

describe('核心 props', () => {
  it('來自靜態報告的 24 種：鍵與順序和原形狀相同（不含 source）', () => {
    for (const [id, keys] of Object.entries(CORE_KEYS)) {
      expect(Object.keys(core[id as keyof typeof core].shape), id).toEqual(keys)
      expect(Object.keys(catalog.components[id].props.properties ?? {}), id).toEqual(keys)
    }
  })

  it('匯出項目層 schema，讓各產品可以在巢狀項目加欄位（例如引用編號）', async () => {
    const mod = await import('../src/index.ts')
    expect(Object.keys(mod.KeyFigureItem.shape)).toEqual(['label', 'value', 'unit'])
    const extended = mod.core.KeyFigures.extend({ items: mod.KeyFigureItem.extend({ ref: mod.z.number() }).array() })
    expect(extended.safeParse({ items: [{ label: 'a', value: 1, unit: null, ref: 2 }] }).success).toBe(true)
    for (const name of ['HighlightItem', 'StepItem', 'LabeledValue', 'ChartSeries', 'RegionValue', 'ComparisonColumn', 'TimelineItem', 'TreeNode', 'DecisionNode']) {
      expect((mod as Record<string, unknown>)[name], name).toBeTruthy()
    }
  })

  it('每個元件的合法範例通過、不合法範例失敗', () => {
    for (const id of Object.keys(catalog.components)) {
      const schema = core[id as keyof typeof core]
      expect(id in VALID && id in INVALID, id).toBe(true)
      expect(schema.safeParse(VALID[id]).success, `${id} 合法範例`).toBe(true)
      expect(schema.safeParse(INVALID[id]).success, `${id} 不合法範例`).toBe(false)
    }
  })

  it('JSON Schema 只用約定的子集關鍵字', () => {
    const seen = new Set<string>()
    for (const [, c] of entries) {
      collectKeywords(c.props, seen)
      for (const v of c.renderers.canvas.variants) collectKeywords(v.props, seen)
    }
    for (const k of seen) expect(SUBSET_KEYWORDS, k).toContain(k)
    const text = JSON.stringify(catalog)
    expect(text).not.toContain('9007199254740991')
    expect(text).not.toContain('$schema')
  })
})

describe('畫布變體', () => {
  it('每個變體都有轉換程式名稱、三語步驟說明與步數上限', () => {
    for (const [id, c] of entries) {
      for (const v of c.renderers.canvas.variants) {
        expect(v.adapter, id).toMatch(/^[a-z][a-z0-9-]*$/)
        for (const lang of LOCALES) expect(v.steps[lang]?.trim(), `${id} ${v.template} steps.${lang}`).toBeTruthy()
        expect(Number.isInteger(v.steps.max) && v.steps.max >= 1 && v.steps.max <= 20, `${id} ${v.template}`).toBe(true)
        expect(v.props.type, `${id} ${v.template}`).toBe('object')
      }
    }
  })

  it('limits 的路徑都指得到核心或畫布擴充裡的欄位', () => {
    for (const [id, c] of entries) {
      for (const v of c.renderers.canvas.variants) {
        for (const path of Object.keys(v.limits)) {
          const head = path.split(/[.[]/)[0]
          const known = head === '*' || head in (c.props.properties ?? {}) || head in (v.props.properties ?? {})
          expect(known, `${id} ${v.template} limits.${path}`).toBe(true)
        }
      }
    }
  })

  it('Chart 依 kind 選變體：長條、橫向長條用長條圖，折線用曲線圖，其他不支援', () => {
    const chart = (kind: string) => ({ ...(VALID.Chart as object), kind })
    expect(selectVariant('Chart', chart('bar'))?.template).toBe('diagram-bar-chart')
    expect(selectVariant('Chart', chart('horizontal-bar'))?.template).toBe('diagram-bar-chart')
    expect(selectVariant('Chart', chart('line'))?.template).toBe('diagram-curve-chart')
    for (const kind of ['pie', 'stacked-bar', 'area', 'combo', 'waterfall']) expect(selectVariant('Chart', chart(kind)), kind).toBeNull()
  })

  it('KeyFigures：1～4 項用數字跳動，5～6 項或直接指定時用指標膠囊', () => {
    const items = (n: number) => ({ items: Array.from({ length: n }, (_, i) => ({ label: `項目 ${i}`, value: i, unit: null })) })
    expect(selectVariant('KeyFigures', items(3))?.template).toBe('diagram-countup')
    expect(selectVariant('KeyFigures', items(5))?.template).toBe('diagram-pills')
    expect(selectVariant('KeyFigures', items(2), 'diagram-pills')?.template).toBe('diagram-pills')
    expect(selectVariant('KeyFigures', items(2), 'diagram-flow')).toBeNull()
  })

  it('沒有畫布變體的元件選不到變體', () => {
    expect(selectVariant('Delta', VALID.Delta)).toBeNull()
    expect(selectVariant('NoSuchComponent', {})).toBeNull()
  })
})

describe('設計 token', () => {
  it('深色與淺色有同一組語意名稱，色值都是 #rrggbb；圖表色盤 8 色', () => {
    const { dark, light, palette } = catalog.tokens
    expect(Object.keys(light)).toEqual(Object.keys(dark))
    for (const k of ['bg', 'card', 'line', 'text', 'textMuted', 'primary', 'flow', 'warn', 'bad', 'ok']) expect(dark, k).toHaveProperty(k)
    for (const v of [...Object.values(dark), ...Object.values(light), ...palette]) expect(v).toMatch(/^#[0-9a-f]{6}$/)
    expect(palette).toHaveLength(8)
  })
})

describe('產生檔', () => {
  it('版本號與 package.json 相同', () => {
    const pkg = JSON.parse(readFileSync(resolve(here, '../package.json'), 'utf8'))
    expect(catalog.catalogVersion).toBe(CATALOG_VERSION)
    expect(CATALOG_VERSION).toBe(pkg.version)
  })

  it('dist/catalog.json 與原始碼重建的結果逐位元相同（改了原始碼要跑 npm run build）', () => {
    const onDisk = readFileSync(resolve(here, '../dist/catalog.json'), 'utf8')
    expect(onDisk).toBe(serializeCatalog())
    expect(onDisk.endsWith('\n')).toBe(true)
    expect(onDisk.includes('\r')).toBe(false)
  })

  it('序列化結果穩定（同一份原始碼重建兩次相同）', () => {
    expect(serializeCatalog()).toBe(serializeCatalog())
  })
})
