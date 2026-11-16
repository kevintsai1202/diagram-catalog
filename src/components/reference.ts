import { z } from 'zod'
import { core } from '../core.ts'
import { defineComponent, kw, steps, t } from '../types.ts'

/** 表格、對照、時間軸、圖片與來源清單。 */

export const DataTable = defineComponent({
  id: 'DataTable',
  version: 1,
  category: 'table',
  name: t('表格', 'Data table', '表'),
  summary: t('只留需要的列與欄的精簡表格', 'A compact table with only the rows and columns that matter', '必要な行と列だけの簡潔な表'),
  aiGuide: t(
    'columns 是表頭，rows 每列的格數與 columns 相同。影片做成稽核表：最多 3 欄、12 列，最後一欄若是 pass／fail／warn 會畫成狀態圖示。',
    'columns is the header; every row has one cell per column. In video it becomes an audit table: up to 3 columns and 12 rows, and a last column of pass/fail/warn is drawn as status icons.',
    'columns は見出し、rows の各行は columns と同じセル数。動画では監査表になり、最大 3 列・12 行、最後の列が pass／fail／warn ならステータスアイコンで描く。',
  ),
  keywords: kw(['表格', '對照表', '稽核', '檢查結果'], ['table', 'audit', 'results'], ['表', '一覧', '監査']),
  props: core.DataTable,
  react: { status: 'full', component: 'DataTable' },
  canvas: {
    status: 'partial',
    variants: [
      {
        template: 'diagram-audit-table',
        adapter: 'audit-table',
        when: null,
        steps: steps(12, '第 i 步出現第 i 列並亮起狀態', 'Step i reveals row i and lights its status', 'i ステップ目で i 行目を表示しステータスを点灯'),
        limits: { columns: { minItems: 1, maxItems: 3 }, 'columns[]': { maxLength: 24 }, rows: { maxItems: 12 }, 'rows[][]': { maxLength: 40 }, title: { maxLength: 60 }, summary: { maxLength: 60 } },
        props: z.object({ summary: z.string().nullable().optional() }),
      },
    ],
  },
})

export const Comparison = defineComponent({
  id: 'Comparison',
  version: 1,
  category: 'compare',
  name: t('雙欄對照', 'Comparison', '比較'),
  summary: t('左右兩欄對照兩種做法、兩個時期或兩份文件', 'Two columns comparing two approaches, periods or documents', '2 つのやり方・時期・文書を左右で比較'),
  aiGuide: t(
    '兩邊各列幾點、每點一句；要強調的點放進畫布擴充的 highlights。程式碼對照時設 mono。',
    'List a few one-sentence points on each side; put points to emphasise in the canvas extension highlights. Set mono when comparing code.',
    '左右それぞれ数点を一文ずつ。強調したい点は canvas 拡張の highlights に。コードを比べるときは mono を設定。',
  ),
  keywords: kw(['對照', '比較', '前後', '優缺點', '差異'], ['compare', 'versus', 'before and after', 'pros and cons'], ['比較', '対比', 'ビフォーアフター']),
  props: core.Comparison,
  react: { status: 'full', component: 'Comparison' },
  canvas: {
    status: 'full',
    variants: [
      {
        template: 'diagram-compare',
        adapter: 'compare',
        when: null,
        steps: steps(3, '第 1 步左欄出現、第 2 步右欄出現；有 highlights 時第 3 步同時強調全部', 'Step 1 shows the left column, step 2 the right column; with highlights, step 3 emphasises all of them at once', '1 ステップ目で左列、2 ステップ目で右列を表示。highlights があれば 3 ステップ目でまとめて強調'),
        limits: {
          'left.title': { maxLength: 40 },
          'right.title': { maxLength: 40 },
          'left.points': { maxItems: 12 },
          'right.points': { maxItems: 12 },
          '*.points[]': { maxLength: 120 },
          title: { maxLength: 60 },
          highlights: { maxItems: 4 },
        },
        props: z.object({
          title: z.string().nullable().optional(),
          mono: z.boolean().optional(),
          highlights: z
            .array(z.object({ side: z.enum(['left', 'right']), from: z.number().int().min(1), to: z.number().int().min(1) }))
            .optional(),
        }),
      },
    ],
  },
})

export const Timeline = defineComponent({
  id: 'Timeline',
  version: 1,
  category: 'sequence',
  name: t('時間軸', 'Timeline', 'タイムライン'),
  summary: t('依時間排列的事件或里程碑', 'Events or milestones in time order', '時系列に並べた出来事やマイルストーン'),
  aiGuide: t(
    '依時間先後排列；date 寫成短字串（2024、2024 春、3 月），text 一句。',
    'Order items by time; date is a short string (2024, Spring 2024, March) and text is one sentence.',
    '時系列順に並べる。date は短い文字列（2024、2024 春、3 月）、text は一文。',
  ),
  keywords: kw(['時間軸', '里程碑', '歷程', '沿革', '年表'], ['timeline', 'milestones', 'history', 'roadmap'], ['タイムライン', '沿革', '年表', 'マイルストーン']),
  props: core.Timeline,
  react: { status: 'full', component: 'Timeline' },
  canvas: {
    status: 'full',
    variants: [
      {
        template: 'diagram-timeline',
        adapter: 'timeline',
        when: null,
        steps: steps(11, '第 i 步鏡頭移到第 i 站；開啟 overview 時多一步拉遠看全部', 'Step i pans to stop i; with overview on, one extra step zooms out to show all stops', 'i ステップ目で i 番目の地点へ移動。overview が有効ならもう 1 ステップで全体を表示'),
        limits: { items: { maxItems: 10 }, 'items[].date': { maxLength: 20 }, 'items[].title': { maxLength: 40 }, 'items[].text': { maxLength: 120 }, title: { maxLength: 60 } },
        props: z.object({ title: z.string().nullable().optional(), overview: z.boolean().optional() }),
      },
    ],
  },
})

export const Figure = defineComponent({
  id: 'Figure',
  version: 1,
  category: 'media',
  name: t('圖片', 'Figure', '図'),
  summary: t('顯示一張既有的圖片並加說明', 'Shows an existing image with a caption', '既存の画像を説明付きで表示'),
  aiGuide: t(
    '只能用已經存在的圖片（照片、截圖、示意圖），不產生新圖。影片的圖片放畫布擴充的 image（素材 id），要框出或放大的區域放 regions（左上角與寬高，佔整張圖的百分比）。',
    'Only for existing images (photos, screenshots, illustrations); never generate one. For video, put the asset id in the canvas extension image and the areas to frame or zoom in regions (top-left corner and size as percentages of the image).',
    '既存の画像（写真・スクリーンショット・図）専用で、新しい画像は作らない。動画では素材 id を canvas 拡張の image に、枠や拡大する範囲を regions（左上と幅高さ、画像に対する百分率）に入れる。',
  ),
  keywords: kw(['圖片', '截圖', '照片', '示意圖'], ['image', 'screenshot', 'photo', 'figure'], ['画像', 'スクリーンショット', '写真']),
  props: core.Figure,
  react: { status: 'full', component: 'Figure' },
  canvas: {
    status: 'full',
    variants: [
      {
        template: 'diagram-image-focus',
        adapter: 'image-focus',
        when: null,
        steps: steps(8, '第 i 步框出或放大第 i 個區域', 'Step i frames or zooms into region i', 'i ステップ目で i 番目の範囲を枠で囲むか拡大'),
        limits: { regions: { maxItems: 8 }, 'regions[].note': { maxLength: 40 }, title: { maxLength: 60 } },
        props: z.object({
          image: z.string(),
          title: z.string().nullable().optional(),
          regions: z
            .array(
              z.object({
                x: z.number().min(0).max(100),
                y: z.number().min(0).max(100),
                w: z.number().min(0).max(100),
                h: z.number().min(0).max(100),
                note: z.string().nullable(),
              }),
            )
            .optional(),
          mode: z.enum(['frame', 'zoom']).optional(),
        }),
      },
    ],
  },
})

export const SourceList = defineComponent({
  id: 'SourceList',
  version: 1,
  category: 'layout',
  name: t('來源清單', 'Source list', '出典一覧'),
  summary: t('列出引用的所有資料來源（樣板用）', 'Lists every cited source (for templates)', '引用したすべての出典を一覧表示（テンプレート用）'),
  aiGuide: t('樣板用，影片不需要。', 'For templates; not used in videos.', 'テンプレート用。動画では使わない。'),
  keywords: kw(['來源', '參考資料'], ['sources', 'references'], ['出典', '参考資料']),
  props: core.SourceList,
  react: { status: 'full', component: 'SourceList' },
  canvas: { status: 'none', variants: [] },
})
