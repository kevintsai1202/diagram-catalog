import { z } from 'zod'
import { core } from '../core.ts'
import { defineComponent, kw, steps, t } from '../types.ts'

/** 文字類：段落、提示框、重點、引言、步驟、註腳、清單。 */

export const Paragraph = defineComponent({
  id: 'Paragraph',
  version: 1,
  category: 'text',
  name: t('段落', 'Paragraph', '段落'),
  summary: t('一段文字；影片裡可逐句或逐個字句標出重點', 'A paragraph of text; in a video, sentences or phrases get highlighted one by one', '一段落の文章。動画では文やフレーズを順に強調する'),
  aiGuide: t(
    'text 放一段完整的文字（可分句）。做成影片時，想強調的字句放進畫布擴充的 marks（每個標記一句要框的原文，可加旁註）；不給 marks 就每句一步。',
    'Put one complete paragraph in text. For video, list the exact phrases to highlight in the canvas extension marks (each may carry a side note); without marks every sentence is one step.',
    'text に一段落の文章を入れる。動画では強調したい語句を canvas 拡張の marks に原文のまま並べる（注記も可）。marks がなければ一文ずつ 1 ステップ。',
  ),
  keywords: kw(['段落', '重點句', '畫線', '標出'], ['paragraph', 'highlight', 'quote text'], ['段落', 'ハイライト', '強調']),
  props: core.Paragraph,
  react: { status: 'full', component: 'Paragraph' },
  canvas: {
    status: 'full',
    variants: [
      {
        template: 'diagram-text-highlight',
        adapter: 'text-highlight',
        when: null,
        steps: steps(20, '第 i 步標出第 i 個標記；沒有標記時第 i 步標出第 i 句', 'Step i highlights mark i; without marks, step i highlights sentence i', 'i ステップ目で i 番目のマーク（マークがなければ i 番目の文）を強調'),
        limits: { text: { maxLength: 600 }, title: { maxLength: 60 }, marks: { maxItems: 20 }, 'marks[].note': { maxLength: 40 } },
        props: z.object({
          title: z.string().nullable().optional(),
          marks: z.array(z.object({ phrase: z.string().nullable(), note: z.string().nullable() })).optional(),
          style: z.enum(['box', 'marker', 'underline']).optional(),
        }),
      },
    ],
  },
})

export const Callout = defineComponent({
  id: 'Callout',
  version: 1,
  category: 'text',
  name: t('提示框', 'Callout', '注意書き'),
  summary: t('提醒或補充說明：資料限制、口徑差異、依據不足', 'A note or caveat: data limits, definition differences, weak evidence', '補足や注意：データの制約、定義の違い、根拠不足'),
  aiGuide: t(
    'tone 用 warn 表示限制或警告、info 表示補充；text 一兩句。影片目前不支援，可改用 Section 的標題卡。',
    'tone is warn for limits or warnings, info for extra notes; text is one or two sentences. Not supported in video yet; use a Section title card instead.',
    'tone は制約・警告なら warn、補足なら info。text は一、二文。動画は未対応なので Section の見出しカードで代用する。',
  ),
  keywords: kw(['提醒', '注意', '補充', '限制'], ['note', 'caveat', 'warning'], ['注意', '補足']),
  props: core.Callout,
  react: { status: 'full', component: 'Callout' },
  canvas: { status: 'none', variants: [] },
})

export const Highlights = defineComponent({
  id: 'Highlights',
  version: 1,
  category: 'text',
  name: t('重點條列', 'Highlights', '要点'),
  summary: t('2～5 個重點，每點一個短標題加一句說明', 'Two to five key points, each with a short title and one sentence', '2～5 個の要点。短い見出しと一文の説明'),
  aiGuide: t(
    '每點 title 4～12 字、text 一句。做成影片時每個重點是一個場景，依序切換。',
    'Each point has a 2–6 word title and one sentence. In a video each point becomes one scene, shown in turn.',
    '各要点は短い title と一文の text。動画では要点ごとに 1 シーンになり、順に切り替わる。',
  ),
  keywords: kw(['重點', '要點', '條列', '摘要'], ['highlights', 'key points', 'takeaways'], ['要点', 'ポイント', 'まとめ']),
  props: core.Highlights,
  react: { status: 'full', component: 'Highlights' },
  canvas: {
    status: 'partial',
    variants: [
      {
        template: 'diagram-scenes',
        adapter: 'scenes-highlights',
        when: null,
        steps: steps(8, '第 i 步切到第 i 個重點的場景', 'Step i switches to the scene for point i', 'i ステップ目で i 番目の要点のシーンに切り替え'),
        limits: { items: { maxItems: 8 }, 'items[].title': { maxLength: 40 }, 'items[].text': { maxLength: 120 }, title: { maxLength: 40 } },
        props: z.object({ title: z.string().nullable().optional(), transition: z.enum(['fade', 'slide']).optional() }),
      },
    ],
  },
})

export const Quote = defineComponent({
  id: 'Quote',
  version: 1,
  category: 'text',
  name: t('引言', 'Quote', '引用'),
  summary: t('引用原文的一句關鍵話', 'One key sentence quoted verbatim', '原文から引いた要の一文'),
  aiGuide: t(
    'text 照抄原文，不改寫。影片的出處文字放畫布擴充的 by（例如人名或文件名）。',
    'Copy text verbatim; do not paraphrase. For video, put the attribution (person or document) in the canvas extension by.',
    'text は原文どおりに写し、言い換えない。動画の出典（人名や文書名）は canvas 拡張の by に入れる。',
  ),
  keywords: kw(['引言', '引用', '名言', '原話'], ['quote', 'citation', 'saying'], ['引用', '名言']),
  props: core.Quote,
  react: { status: 'full', component: 'Quote' },
  canvas: {
    status: 'partial',
    variants: [
      {
        template: 'diagram-scenes',
        adapter: 'scenes-quote',
        when: null,
        steps: steps(1, '第 1 步顯示引言', 'Step 1 shows the quote', '1 ステップ目で引用を表示'),
        limits: { text: { maxLength: 160 }, by: { maxLength: 40 } },
        props: z.object({ by: z.string().nullable().optional() }),
      },
    ],
  },
})

export const Steps = defineComponent({
  id: 'Steps',
  version: 1,
  category: 'sequence',
  name: t('步驟', 'Steps', 'ステップ'),
  summary: t('依序編號的流程或步驟', 'A numbered process or sequence of steps', '番号付きの手順・流れ'),
  aiGuide: t(
    '每步 title 是短名詞（2～8 字），text 一句說明。影片做成流程管線，只畫 title、text 會略去；最後的結論放畫布擴充的 conclusion。',
    'Each step has a short noun title and a one-sentence text. In video it becomes a pipeline that shows only titles (text is dropped); put a closing takeaway in the canvas extension conclusion.',
    '各ステップの title は短い名詞、text は一文。動画ではパイプラインになり title だけを描く（text は省かれる）。結論は canvas 拡張の conclusion に。',
  ),
  keywords: kw(['步驟', '流程', '程序', '管線', '先後'], ['steps', 'process', 'pipeline', 'workflow'], ['手順', '流れ', 'プロセス', 'パイプライン']),
  props: core.Steps,
  react: { status: 'full', component: 'Steps' },
  canvas: {
    status: 'partial',
    variants: [
      {
        template: 'diagram-pipeline',
        adapter: 'pipeline',
        when: null,
        steps: steps(8, '第 i 步點亮第 i 個節點', 'Step i lights up node i', 'i ステップ目で i 番目のノードを点灯'),
        limits: { items: { maxItems: 8 }, 'items[].title': { maxLength: 40 }, title: { maxLength: 60 }, subtitle: { maxLength: 80 }, conclusion: { maxLength: 40 } },
        props: z.object({
          title: z.string().nullable().optional(),
          subtitle: z.string().nullable().optional(),
          conclusion: z.string().nullable().optional(),
        }),
      },
    ],
  },
})

export const Footnote = defineComponent({
  id: 'Footnote',
  version: 1,
  category: 'text',
  name: t('註腳', 'Footnote', '脚注'),
  summary: t('資料口徑、四捨五入等小字說明（樣板用）', 'Small print such as definitions or rounding (for templates)', 'データの定義や端数処理などの注記（テンプレート用）'),
  aiGuide: t('樣板用，影片不需要。', 'For templates; not used in videos.', 'テンプレート用。動画では使わない。'),
  keywords: kw(['註腳', '附註'], ['footnote', 'note'], ['脚注', '注記']),
  props: core.Footnote,
  react: { status: 'full', component: 'Footnote' },
  canvas: { status: 'none', variants: [] },
})

export const Checklist = defineComponent({
  id: 'Checklist',
  version: 1,
  category: 'sequence',
  name: t('清單打勾', 'Checklist', 'チェックリスト'),
  summary: t('逐項檢查並顯示結果的工作清單', 'A task list where each item is checked and shows its result', '項目ごとにチェックして結果を表示する作業リスト'),
  aiGuide: t(
    'items 一項一個檢查項目；status 用 ok、fail、warn、skip，或 10 字內的自訂狀態（例如「待產生」）。',
    'One check per item; status is ok, fail, warn, skip, or a custom label of up to 10 characters (e.g. "pending").',
    'items は 1 項目 1 チェック。status は ok、fail、warn、skip、または 10 文字以内の独自ラベル（例：「生成待ち」）。',
  ),
  keywords: kw(['清單', '檢查', '打勾', '待辦', '進度'], ['checklist', 'to-do', 'check', 'status'], ['チェックリスト', '確認', 'やること']),
  props: core.Checklist,
  react: { status: 'none', component: null },
  canvas: {
    status: 'full',
    variants: [
      {
        template: 'diagram-checklist',
        adapter: 'checklist',
        when: null,
        steps: steps(10, '第 i 步出現第 i 項並轉圈後顯示結果', 'Step i reveals item i, spins, then shows its result', 'i ステップ目で i 番目の項目が現れ、回転のあと結果を表示'),
        limits: { items: { maxItems: 10 }, 'items[].label': { maxLength: 60 }, 'items[].status': { maxLength: 10 }, title: { maxLength: 60 }, loading: { maxLength: 30 }, done: { maxLength: 30 } },
        props: z.object({
          loading: z.string().nullable().optional(),
          done: z.string().nullable().optional(),
          workTime: z.number().min(0.2).max(3).optional(),
        }),
      },
    ],
  },
})
