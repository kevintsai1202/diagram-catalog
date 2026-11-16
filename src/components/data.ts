import { z } from 'zod'
import { core } from '../core.ts'
import { defineComponent, kw, steps, t } from '../types.ts'

/** 數字與圖表類。衍生值（增減、比例、累計）一律由畫面計算，元件只收原始數值。 */

/** 「下一步／預告」卡片（指標膠囊用）。 */
const NextCard = z.object({ label: z.string().nullable(), title: z.string(), text: z.string().nullable() })

export const KeyFigures = defineComponent({
  id: 'KeyFigures',
  version: 1,
  category: 'number',
  name: t('關鍵數字', 'Key figures', '主要な数字'),
  summary: t('幾個並列的關鍵數字卡', 'A row of key figure cards', '主要な数字を並べたカード'),
  aiGuide: t(
    '每項一個指標：label 說明、value 是原始數值（照抄資料，不自己換算）、unit 單位。1～4 項做成數字跳動；5～6 項或想在最後預告下一步時用指標膠囊（canvas.variant 指定 diagram-pills）。',
    'One metric per item: label, the raw value (copied from the source, never derived), and unit. 1–4 items become count-up figures; use pills (canvas.variant diagram-pills) for 5–6 items or to end with a "next" card.',
    '1 項目 1 指標：label、元の数値 value（資料どおり、自分で換算しない）、unit。1～4 項目はカウントアップ。5～6 項目や最後に「次へ」カードを出すときはピル（canvas.variant に diagram-pills）。',
  ),
  keywords: kw(['數字', '指標', '成果', 'KPI', '統計'], ['figures', 'metrics', 'KPI', 'stats', 'numbers'], ['数字', '指標', 'KPI', '実績']),
  props: core.KeyFigures,
  react: { status: 'full', component: 'KeyFigures' },
  canvas: {
    status: 'full',
    variants: [
      {
        template: 'diagram-pills',
        adapter: 'pills',
        when: { count: 'items', min: 5, max: 6 },
        steps: steps(7, '第 i 步彈出第 i 枚膠囊；有預告卡時多一步讓卡片飛入', 'Step i pops pill i; one extra step flies in the next card if present', 'i ステップ目で i 番目のピルを表示。予告カードがあればもう 1 ステップでカードが入る'),
        limits: { items: { minItems: 1, maxItems: 6 }, 'items[].label': { maxLength: 60 }, title: { maxLength: 60 }, 'next.label': { maxLength: 12 }, 'next.title': { maxLength: 40 }, 'next.text': { maxLength: 120 } },
        props: z.object({ title: z.string().nullable().optional(), next: NextCard.nullable().optional() }),
      },
      {
        template: 'diagram-countup',
        adapter: 'countup',
        when: null,
        steps: steps(4, '第 i 步彈出第 i 個指標並從 0 數到目標值', 'Step i pops metric i and counts up from 0', 'i ステップ目で i 番目の指標を表示し 0 からカウントアップ'),
        limits: { items: { minItems: 1, maxItems: 4 }, 'items[].label': { maxLength: 60 }, title: { maxLength: 60 } },
        props: z.object({ title: z.string().nullable().optional(), countTime: z.number().min(0.5).max(5).optional() }),
      },
    ],
  },
})

export const Delta = defineComponent({
  id: 'Delta',
  version: 1,
  category: 'number',
  name: t('前後增減', 'Delta', '増減'),
  summary: t('同一指標前後兩期的數值與增減', 'One metric at two points in time and the change between them', '同じ指標の前後 2 時点の値と増減'),
  aiGuide: t(
    'before／after 各放一期的原始數值，增減與箭頭由畫面計算，不要自己算差額。影片目前不支援，可改用 KeyFigures 放兩個數字。',
    'Put the raw value for each period in before and after; the change and arrow are computed by the renderer. Not supported in video yet; use KeyFigures with two items instead.',
    'before／after に各時点の元の数値を入れる。増減と矢印は描画側で計算する。動画は未対応なので KeyFigures の 2 項目で代用する。',
  ),
  keywords: kw(['增減', '成長', '前後比較', '變化'], ['delta', 'change', 'growth', 'before and after'], ['増減', '変化', '前後比較']),
  props: core.Delta,
  react: { status: 'full', component: 'Delta' },
  canvas: { status: 'none', variants: [] },
})

export const Gauge = defineComponent({
  id: 'Gauge',
  version: 1,
  category: 'number',
  name: t('環形比例', 'Gauge', 'ゲージ'),
  summary: t('單一比例或達成率的環形圖', 'A ring showing a single ratio or completion rate', '単一の割合や達成率を示すリング'),
  aiGuide: t(
    'value 是原始數值、max 是滿格（百分比通常 100）。',
    'value is the raw number and max is the full scale (usually 100 for percentages).',
    'value は元の数値、max は満点（百分率なら通常 100）。',
  ),
  keywords: kw(['比例', '達成率', '完成度', '百分比'], ['gauge', 'ratio', 'percentage', 'completion'], ['割合', '達成率', '進捗']),
  props: core.Gauge,
  react: { status: 'full', component: 'Gauge' },
  canvas: {
    status: 'full',
    variants: [
      {
        template: 'diagram-countup',
        adapter: 'countup-gauge',
        when: null,
        steps: steps(1, '第 1 步彈出環形並從 0 數到目標值', 'Step 1 pops the ring and counts up from 0', '1 ステップ目でリングを表示し 0 からカウントアップ'),
        limits: { label: { maxLength: 60 }, title: { maxLength: 60 } },
        props: z.object({ title: z.string().nullable().optional(), countTime: z.number().min(0.5).max(5).optional() }),
      },
    ],
  },
})

export const Ranking = defineComponent({
  id: 'Ranking',
  version: 1,
  category: 'number',
  name: t('排行榜', 'Ranking', 'ランキング'),
  summary: t('依數值由高到低排列的排行', 'Items ranked from highest to lowest value', '値の大きい順に並べたランキング'),
  aiGuide: t(
    'items 放名稱與原始數值，順序不拘（畫面會排序，第一名醒目）。',
    'List names with raw values in any order; the renderer sorts them and emphasises the top item.',
    'items に名前と元の数値を入れる。順序は問わない（描画側で並べ替え、1 位を強調）。',
  ),
  keywords: kw(['排行', '排名', '前幾名', '最高'], ['ranking', 'top', 'leaderboard'], ['ランキング', '順位', '上位']),
  props: core.Ranking,
  react: { status: 'full', component: 'Ranking' },
  canvas: {
    status: 'partial',
    variants: [
      {
        template: 'diagram-bar-chart',
        adapter: 'bar-ranking',
        when: null,
        steps: steps(12, '第 i 步長出第 i 根長條（依數值由高到低）', 'Step i grows bar i (highest value first)', 'i ステップ目で i 本目のバーを伸ばす（値の大きい順）'),
        limits: { items: { maxItems: 12 }, 'items[].label': { maxLength: 40 }, title: { maxLength: 60 }, unit: { maxLength: 8 } },
        props: z.object({ decimals: z.number().int().min(0).max(3).optional() }),
      },
    ],
  },
})

export const Progress = defineComponent({
  id: 'Progress',
  version: 1,
  category: 'number',
  name: t('比例條', 'Progress bars', '割合バー'),
  summary: t('多項比例條，例如各類別占比', 'Several proportion bars, such as the share of each category', 'カテゴリごとの構成比などを示す複数のバー'),
  aiGuide: t(
    'max 是滿格（百分比通常 100），每項放原始數值。',
    'max is the full scale (usually 100 for percentages); each item holds its raw value.',
    'max は満点（百分率なら通常 100）。各項目に元の数値を入れる。',
  ),
  keywords: kw(['占比', '比例', '組成', '進度'], ['share', 'proportion', 'progress', 'breakdown'], ['構成比', '割合', '進捗']),
  props: core.Progress,
  react: { status: 'full', component: 'Progress' },
  canvas: {
    status: 'full',
    variants: [
      {
        template: 'diagram-bar-chart',
        adapter: 'bar-progress',
        when: null,
        steps: steps(12, '第 i 步長出第 i 根長條', 'Step i grows bar i', 'i ステップ目で i 本目のバーを伸ばす'),
        limits: { items: { maxItems: 12 }, 'items[].label': { maxLength: 40 }, title: { maxLength: 60 }, unit: { maxLength: 8 } },
        props: z.object({ decimals: z.number().int().min(0).max(3).optional(), highlight: z.number().int().min(0).max(12).optional() }),
      },
    ],
  },
})

export const Chart = defineComponent({
  id: 'Chart',
  version: 1,
  category: 'chart',
  name: t('圖表', 'Chart', 'グラフ'),
  summary: t('重新整理資料後畫成的長條、折線等圖表', 'A bar, line or other chart redrawn from the data', 'データを整理して描き直した棒・折れ線などのグラフ'),
  aiGuide: t(
    '類別比較用 bar（類別名稱長用 horizontal-bar），時間趨勢用 line。categories 是橫軸類別，每個 series 的 values 與 categories 一一對應。影片只支援 bar、horizontal-bar（一個 series）與 line（最多 4 條）；其他 kind 請改用 bar。',
    'Use bar to compare categories (horizontal-bar for long names) and line for trends over time. categories is the x axis; each series has one value per category. Video supports only bar and horizontal-bar (one series) and line (up to 4 series); use bar instead of other kinds.',
    'カテゴリ比較は bar（名前が長ければ horizontal-bar）、時系列は line。categories は横軸で、各 series の values は categories と一対一。動画は bar・horizontal-bar（series 1 本）と line（最大 4 本）のみ対応。それ以外の kind は bar に。',
  ),
  keywords: kw(['圖表', '長條圖', '折線圖', '趨勢', '比較'], ['chart', 'bar chart', 'line chart', 'trend'], ['グラフ', '棒グラフ', '折れ線', '推移']),
  props: core.Chart,
  react: { status: 'full', component: 'Chart' },
  canvas: {
    status: 'partial',
    variants: [
      {
        template: 'diagram-bar-chart',
        adapter: 'bar-chart',
        when: { field: 'kind', in: ['bar', 'horizontal-bar'] },
        steps: steps(12, '第 i 步長出第 i 個類別的長條', 'Step i grows the bar for category i', 'i ステップ目で i 番目のカテゴリのバーを伸ばす'),
        limits: { series: { minItems: 1, maxItems: 1 }, categories: { maxItems: 12 }, 'categories[]': { maxLength: 40 }, title: { maxLength: 60 }, unit: { maxLength: 8 } },
        props: z.object({ decimals: z.number().int().min(0).max(3).optional(), highlight: z.number().int().min(0).max(12).optional() }),
      },
      {
        template: 'diagram-curve-chart',
        adapter: 'curve-chart',
        when: { field: 'kind', in: ['line'] },
        steps: steps(4, '第 i 步畫出第 i 條線', 'Step i draws line i', 'i ステップ目で i 本目の線を描く'),
        limits: { series: { minItems: 1, maxItems: 4 }, categories: { minItems: 2, maxItems: 12 }, title: { maxLength: 60 }, xLabel: { maxLength: 20 }, yLabel: { maxLength: 20 } },
        props: z.object({
          smooth: z.boolean().optional(),
          grid: z.boolean().optional(),
          xLabel: z.string().nullable().optional(),
          yLabel: z.string().nullable().optional(),
        }),
      },
    ],
  },
})

export const Heatmap = defineComponent({
  id: 'Heatmap',
  version: 1,
  category: 'chart',
  name: t('熱度表', 'Heatmap', 'ヒートマップ'),
  summary: t('列×欄的數值表，顏色深淺表示大小', 'A rows-by-columns grid where colour intensity shows the value', '行×列の表で、色の濃さが値の大きさを表す'),
  aiGuide: t(
    'values[i][j] 對應 rows[i]、columns[j]，缺值為 null。影片目前不支援。',
    'values[i][j] belongs to rows[i] and columns[j]; use null for missing values. Not supported in video yet.',
    'values[i][j] は rows[i]・columns[j] に対応、欠損は null。動画は未対応。',
  ),
  keywords: kw(['熱度', '交叉表', '矩陣'], ['heatmap', 'matrix', 'cross table'], ['ヒートマップ', 'クロス表']),
  props: core.Heatmap,
  react: { status: 'full', component: 'Heatmap' },
  canvas: { status: 'none', variants: [] },
})

export const RegionMap = defineComponent({
  id: 'RegionMap',
  version: 1,
  category: 'chart',
  name: t('地區方格地圖', 'Region map', '地域マップ'),
  summary: t('依數值著色的地區方格地圖', 'A tile map of regions coloured by value', '値で色分けした地域のタイルマップ'),
  aiGuide: t(
    'region 用渲染器認得的地區名稱。影片目前不支援。',
    'Use region names the renderer recognises. Not supported in video yet.',
    'region は描画側が認識できる地域名を使う。動画は未対応。',
  ),
  keywords: kw(['地圖', '縣市', '地區分布'], ['map', 'regions', 'geography'], ['地図', '地域', '都道府県']),
  props: core.RegionMap,
  react: { status: 'full', component: 'RegionMap' },
  canvas: { status: 'none', variants: [] },
})
