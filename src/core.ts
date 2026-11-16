import { z } from 'zod'

/**
 * 共用核心 props（zod）。兩種渲染器都成立的語意與形狀，不帶任何渲染器的上限。
 *
 * - 前 24 種沿用靜態報告渲染器原本的形狀（鍵的順序也相同），只拿掉引用欄位 `source`
 *   與報告根節點的 template／templateName；需要引用的產品自行 `.extend()` 加回去。
 * - 巢狀項目另外匯出（例如 `KeyFigureItem`），產品才能在項目層加欄位。
 * - 選填文字一律用 `.nullable()`（模型寫 null），與原形狀一致。
 */

/** 單位（可為 null）。 */
const unit = z.string().nullable()
/** 可省略的文字。 */
const optionalText = z.string().nullable()

// ───── 項目層 schema ─────

/** 重點條列的一項：短標題＋一句說明。 */
export const HighlightItem = z.object({ title: z.string(), text: z.string() })
/** 流程的一步：標題＋說明。 */
export const StepItem = z.object({ title: z.string(), text: z.string() })
/** 關鍵數字的一項。 */
export const KeyFigureItem = z.object({ label: z.string(), value: z.number(), unit })
/** 名稱＋數值（排行、比例條、增減的前後兩期共用）。 */
export const LabeledValue = z.object({ label: z.string(), value: z.number() })
/** 圖表的一個數列；values 與 categories 一一對應，缺值為 null。 */
export const ChartSeries = z.object({ name: z.string(), values: z.array(z.number().nullable()) })
/** 地區＋數值。 */
export const RegionValue = z.object({ region: z.string(), value: z.number() })
/** 對照的一欄。 */
export const ComparisonColumn = z.object({ title: z.string(), points: z.array(z.string()).min(1) })
/** 時間軸的一站。 */
export const TimelineItem = z.object({ date: z.string(), title: z.string(), text: z.string() })
/** 程式碼的一步：這一步要強調的行號（1 起算）。 */
export const CodeStep = z.object({ lines: z.array(z.number().int().min(1)) })
/** 終端機的一個指令與它的輸出（每行一筆；開頭可用 ✓ ✗ ! 表示成功、失敗、警告）。 */
export const TerminalCommand = z.object({ command: z.string(), output: z.array(z.string()) })
/** 清單的一項：項目＋狀態（ok、fail、warn、skip，或簡短的自訂文字）。 */
export const ChecklistItem = z.object({ label: z.string(), status: z.string() })
/** 階層樹的節點（遞迴）。 */
export const TreeNode: z.ZodType<TreeNodeValue> = z
  .object({
    label: z.string(),
    get children() {
      return z.array(TreeNode).optional()
    },
  })
  .meta({ id: 'TreeNode' })
export interface TreeNodeValue {
  label: string
  children?: TreeNodeValue[]
}
/** 決策樹的節點（遞迴）：decision 是判斷、result 是結果；branch 是從上一層走到這裡的分支標籤。 */
export const DecisionNode: z.ZodType<DecisionNodeValue> = z
  .object({
    label: z.string(),
    kind: z.enum(['decision', 'result']),
    branch: optionalText.optional(),
    get children() {
      return z.array(DecisionNode).optional()
    },
  })
  .meta({ id: 'DecisionNode' })
export interface DecisionNodeValue {
  label: string
  kind: 'decision' | 'result'
  branch?: string | null
  children?: DecisionNodeValue[]
}
/** 架構圖的方塊：名稱與格位（欄、列，1 起算）。 */
export const FlowBox = z.object({ name: z.string(), col: z.number().int().min(1), row: z.number().int().min(1) })
/** 架構圖的連線：from／to 是方塊名稱。 */
export const FlowLink = z.object({ from: z.string(), to: z.string(), label: optionalText })
/** 散點圖的一點；有 label 的是要特別標出的點。 */
export const ScatterPoint = z.object({ x: z.number(), y: z.number(), group: z.string(), label: optionalText })
/** 隱喻的一項；weight 只有天平用（省略當 1）。 */
export const MetaphorItem = z.object({ label: z.string(), weight: z.number().nullable() })
/** 隱喻的一組（漏斗的輸入或輸出、天平的一盤、齒輪）。 */
export const MetaphorGroup = z.object({ title: optionalText, items: z.array(MetaphorItem).min(1) })
/** 貼文的互動數（文字，可寫 2.4K 這類縮寫）。 */
export const SocialStats = z.object({ replies: optionalText, reposts: optionalText, likes: optionalText })

// ───── 元件層 schema ─────

/** 36 個元件的核心 props。 */
export const core = {
  // 版面
  Report: z.object({ title: z.string(), summary: z.string().nullable() }),
  Section: z.object({ title: z.string() }),
  Columns: z.object({ count: z.number().int().min(2).max(3) }),
  Slide: z.object({
    title: z.string().nullable(),
    layout: z.enum(['title', 'title-content', 'two-column', 'figures']),
    transition: z.enum(['fade', 'slide', 'zoom']),
  }),
  Divider: z.object({}),
  // 文字
  Paragraph: z.object({ text: z.string() }),
  Callout: z.object({ tone: z.enum(['info', 'warn']), text: z.string() }),
  Highlights: z.object({ items: z.array(HighlightItem).min(1) }),
  Quote: z.object({ text: z.string() }),
  Steps: z.object({ items: z.array(StepItem).min(1) }),
  Footnote: z.object({ text: z.string() }),
  // 數字
  KeyFigures: z.object({ items: z.array(KeyFigureItem) }),
  Delta: z.object({ label: z.string(), before: LabeledValue, after: LabeledValue, unit }),
  Gauge: z.object({ label: z.string(), value: z.number(), max: z.number(), unit }),
  Ranking: z.object({ title: z.string(), unit, items: z.array(LabeledValue).min(2) }),
  Progress: z.object({ title: z.string(), unit, max: z.number(), items: z.array(LabeledValue).min(1) }),
  // 圖表
  Chart: z.object({
    title: z.string(),
    kind: z.enum(['line', 'bar', 'horizontal-bar', 'stacked-bar', 'pie', 'area', 'combo', 'waterfall']),
    unit,
    categories: z.array(z.string()),
    series: z.array(ChartSeries),
  }),
  Heatmap: z.object({
    title: z.string(),
    unit,
    rows: z.array(z.string()).min(1),
    columns: z.array(z.string()).min(1),
    values: z.array(z.array(z.number().nullable())).min(1),
  }),
  RegionMap: z.object({ title: z.string(), unit, items: z.array(RegionValue).min(1) }),
  // 表格、對照、時間、圖片
  DataTable: z.object({ title: z.string(), columns: z.array(z.string()), rows: z.array(z.array(z.string())) }),
  Comparison: z.object({ left: ComparisonColumn, right: ComparisonColumn }),
  Timeline: z.object({ items: z.array(TimelineItem).min(2) }),
  Figure: z.object({ caption: z.string().nullable() }),
  SourceList: z.object({}),
  // 以下 12 種只有動畫渲染器有
  CodeCard: z.object({ title: optionalText, fileName: optionalText, code: z.string(), steps: z.array(CodeStep) }),
  CodeMotion: z.object({
    title: optionalText,
    fileName: optionalText,
    mode: z.enum(['type', 'diff', 'scroll']),
    code: z.string(),
    steps: z.array(CodeStep),
  }),
  Terminal: z.object({ title: optionalText, windowTitle: optionalText, prompt: optionalText, commands: z.array(TerminalCommand).min(1) }),
  Tree: z.object({ title: optionalText, nodes: z.array(TreeNode).min(1) }),
  Decision: z.object({ title: optionalText, root: DecisionNode }),
  Flow: z.object({ title: optionalText, boxes: z.array(FlowBox).min(1), links: z.array(FlowLink) }),
  Scatter: z.object({ title: optionalText, xLabel: optionalText, yLabel: optionalText, points: z.array(ScatterPoint).min(1) }),
  Metaphor: z.object({
    kind: z.enum(['funnel', 'scale', 'gears']),
    title: optionalText,
    inputs: MetaphorGroup,
    outputs: MetaphorGroup.nullable(),
  }),
  Stamp: z.object({ text: z.string(), style: z.enum(['pass', 'fail', 'warn', 'review']), subtext: optionalText }),
  SocialPost: z.object({
    style: z.enum(['micro', 'forum']),
    name: z.string(),
    handle: optionalText,
    community: optionalText,
    postTitle: optionalText,
    text: z.string(),
    stats: SocialStats,
    time: optionalText,
  }),
  Subscribe: z.object({ name: z.string(), subscribers: optionalText, button: optionalText, done: optionalText }),
  Checklist: z.object({ title: optionalText, items: z.array(ChecklistItem).min(1) }),
}

/** 元件 id。 */
export type ComponentId = keyof typeof core

export { z }
