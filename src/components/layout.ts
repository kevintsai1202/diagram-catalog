import { z } from 'zod'
import { core } from '../core.ts'
import { defineComponent, kw, steps, t } from '../types.ts'

/** 版面類：報告根節點、段落、並排、投影片頁、分隔線。 */

export const Report = defineComponent({
  id: 'Report',
  version: 1,
  category: 'layout',
  name: t('報告', 'Report', 'レポート'),
  summary: t('整份圖解報告的根節點：標題與一兩句總結', 'Root of a diagram report: a title and a one- or two-sentence summary', '図解レポートのルート：タイトルと一、二文の要約'),
  aiGuide: t(
    '只在輸出整份報告時當根節點；子元素依序排列。title 寫主題，summary 一兩句總結，沒有就填 null。',
    'Use only as the root of a full report; children follow in order. title is the topic; summary is one or two sentences, or null.',
    'レポート全体を出力するときのルートとしてだけ使う。子要素は順に並ぶ。title は主題、summary は一、二文の要約（なければ null）。',
  ),
  keywords: kw(['報告', '總結', '摘要'], ['report', 'summary'], ['レポート', '要約']),
  props: core.Report,
  react: { status: 'full', component: 'Report' },
  canvas: { status: 'none', variants: [] },
})

export const Section = defineComponent({
  id: 'Section',
  version: 1,
  category: 'layout',
  name: t('段落主題', 'Section', 'セクション'),
  summary: t('一個段落主題，底下放其他內容元件', 'A titled section that groups other content components', '見出し付きのまとまり。中に他のコンテンツ部品を入れる'),
  aiGuide: t(
    '報告裡用來分段；做成影片時只剩一張標題卡。標題寫成短句，不超過 20 字。',
    'Groups content in a report; in a video it becomes a single title card. Keep the title short (about 10 words).',
    'レポートの区切りに使う。動画では見出しカード一枚になる。見出しは短く（20 字程度まで）。',
  ),
  keywords: kw(['段落', '章節', '標題卡'], ['section', 'chapter', 'title card'], ['セクション', '章', '見出し']),
  props: core.Section,
  react: { status: 'full', component: 'Section' },
  canvas: {
    status: 'partial',
    variants: [
      {
        template: 'diagram-scenes',
        adapter: 'scenes-section',
        when: null,
        steps: steps(1, '第 1 步顯示標題卡', 'Step 1 shows the title card', '1 ステップ目で見出しカードを表示'),
        limits: { title: { maxLength: 60 } },
        props: z.object({ transition: z.enum(['fade', 'slide']).optional() }),
      },
    ],
  },
})

export const Columns = defineComponent({
  id: 'Columns',
  version: 1,
  category: 'layout',
  name: t('並排欄', 'Columns', '段組み'),
  summary: t('把子元素並排成 2～3 欄（樣板用）', 'Lays children out in 2–3 columns (for templates)', '子要素を 2～3 段に並べる（テンプレート用）'),
  aiGuide: t(
    '只給樣板與編輯器用，自動產生內容時不要選。',
    'For templates and editors only; do not pick it when generating content.',
    'テンプレートとエディター専用。内容を自動生成するときは選ばない。',
  ),
  keywords: kw(['並排', '分欄'], ['columns', 'side by side'], ['段組み', '並列']),
  props: core.Columns,
  react: { status: 'full', component: 'Columns' },
  canvas: { status: 'none', variants: [] },
})

export const Slide = defineComponent({
  id: 'Slide',
  version: 1,
  category: 'layout',
  name: t('投影片頁', 'Slide', 'スライド'),
  summary: t('投影片的一頁：版型與換頁效果', 'One slide page with a layout and a transition', 'スライド 1 枚：レイアウトと切り替え効果'),
  aiGuide: t(
    '樣板用。做成影片時只保留標題卡，版型與 zoom 換頁沒有對應（zoom 改成淡入淡出）。',
    'For templates. In a video only the title card remains; layouts and the zoom transition have no equivalent (zoom becomes fade).',
    'テンプレート用。動画では見出しカードだけが残り、レイアウトと zoom 切り替えは対応しない（zoom はフェードになる）。',
  ),
  keywords: kw(['投影片', '簡報', '頁'], ['slide', 'deck', 'page'], ['スライド', 'プレゼン']),
  props: core.Slide,
  react: { status: 'full', component: 'Slide' },
  canvas: {
    status: 'partial',
    variants: [
      {
        template: 'diagram-scenes',
        adapter: 'scenes-slide',
        when: null,
        steps: steps(1, '第 1 步顯示這一頁的標題卡', 'Step 1 shows the slide title card', '1 ステップ目でこのページの見出しカードを表示'),
        limits: { title: { maxLength: 60 } },
        props: z.object({}),
      },
    ],
  },
})

export const Divider = defineComponent({
  id: 'Divider',
  version: 1,
  category: 'layout',
  name: t('分隔線', 'Divider', '区切り線'),
  summary: t('段落之間的分隔線（樣板用）', 'A rule between sections (for templates)', 'セクション間の区切り線（テンプレート用）'),
  aiGuide: t('樣板用，影片不需要。', 'For templates; not used in videos.', 'テンプレート用。動画では使わない。'),
  keywords: kw(['分隔'], ['divider', 'rule'], ['区切り']),
  props: core.Divider,
  react: { status: 'full', component: 'Divider' },
  canvas: { status: 'none', variants: [] },
})
