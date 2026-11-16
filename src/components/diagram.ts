import { z } from 'zod'
import { core } from '../core.ts'
import { defineComponent, kw, steps, t } from '../types.ts'

/** 結構圖：階層樹、決策樹、架構資料流、散點圖、動態隱喻（目前只有動畫渲染器有）。 */

/** 展開方式：逐個節點或逐層。 */
const reveal = z.enum(['node', 'level']).optional()

export const Tree = defineComponent({
  id: 'Tree',
  version: 1,
  category: 'structure',
  name: t('階層樹', 'Tree', 'ツリー'),
  summary: t('節點逐個或逐層展開的階層樹', 'A hierarchy whose nodes appear one by one or level by level', 'ノードが一つずつ、または階層ごとに現れる階層図'),
  aiGuide: t(
    'nodes 是第一層（可多個根），每個節點 label 一個短詞，children 放下一層。整棵樹最多 20 個節點、4 層。',
    'nodes is the top level (several roots allowed); each node has a short label and its children. At most 20 nodes and 4 levels in total.',
    'nodes は第 1 階層（ルートは複数可）。各ノードは短い label と children。全体で最大 20 ノード・4 階層。',
  ),
  keywords: kw(['階層', '樹狀', '分類', '架構', '目錄'], ['tree', 'hierarchy', 'taxonomy', 'structure'], ['ツリー', '階層', '分類', '構成']),
  props: core.Tree,
  react: { status: 'none', component: null },
  canvas: {
    status: 'full',
    variants: [
      {
        template: 'diagram-tree',
        adapter: 'tree',
        when: null,
        steps: steps(20, '第 i 步展開第 i 個節點（依先序）或第 i 層', 'Step i reveals node i (pre-order) or level i', 'i ステップ目で i 番目のノード（先行順）または i 階層目を展開'),
        limits: { nodes: { maxNodes: 20, maxDepth: 4 }, title: { maxLength: 60 } },
        props: z.object({ reveal, highlight: z.number().int().min(0).max(20).optional() }),
      },
    ],
  },
})

export const Decision = defineComponent({
  id: 'Decision',
  version: 1,
  category: 'structure',
  name: t('決策樹', 'Decision tree', '決定木'),
  summary: t('是／否判斷一路分支到結果的決策樹', 'A yes/no decision tree that branches down to outcomes', 'はい／いいえで分岐して結果に至る決定木'),
  aiGuide: t(
    'root 從第一個判斷開始。kind 為 decision 的節點是判斷（問句），result 是結果。每個節點最多 2 個子節點，branch 寫走到這個子節點的分支標籤（6 字內，例如「是」「否」）。最多 15 個節點、4 層。',
    'root starts at the first question. Nodes with kind decision are questions; result nodes are outcomes. Each node has at most 2 children, and branch is the label on the edge into that child (up to 6 characters, e.g. "yes", "no"). At most 15 nodes and 4 levels.',
    'root は最初の判断から始める。kind が decision のノードは判断（問い）、result は結果。各ノードの子は最大 2 つで、branch はその子へ進む分岐ラベル（6 文字以内、例：「はい」「いいえ」）。最大 15 ノード・4 階層。',
  ),
  keywords: kw(['決策', '判斷', '是否', '分支', '流程判斷'], ['decision', 'yes or no', 'branch', 'flowchart'], ['決定木', '判断', '分岐', 'はい・いいえ']),
  props: core.Decision,
  react: { status: 'none', component: null },
  canvas: {
    status: 'full',
    variants: [
      {
        template: 'diagram-decision',
        adapter: 'decision',
        when: null,
        steps: steps(15, '第 i 步畫出第 i 個節點（依先序）或第 i 層', 'Step i draws node i (pre-order) or level i', 'i ステップ目で i 番目のノード（先行順）または i 階層目を描く'),
        limits: { root: { maxNodes: 15, maxDepth: 4, maxChildren: 2 }, title: { maxLength: 60 }, yesLabel: { maxLength: 6 }, noLabel: { maxLength: 6 } },
        props: z.object({
          yesLabel: z.string().nullable().optional(),
          noLabel: z.string().nullable().optional(),
          reveal,
          highlight: z.number().int().min(0).max(15).optional(),
        }),
      },
    ],
  },
})

export const Flow = defineComponent({
  id: 'Flow',
  version: 1,
  category: 'structure',
  name: t('架構資料流', 'Flow', 'データフロー'),
  summary: t('方塊排在格子上、連線逐條點亮的架構圖', 'An architecture diagram with boxes on a grid and links lit one by one', 'ボックスを格子に配置し、接続線を一本ずつ点灯する構成図'),
  aiGuide: t(
    'boxes 每個方塊寫名稱與格位（col 欄 1～6、row 列 1～4，同一格只放一個），名稱不可重複。links 的 from／to 寫方塊名稱，label 是線上的短標籤。最多 12 個方塊、16 條連線。',
    'Each box has a unique name and a grid cell (col 1–6, row 1–4; one box per cell). In links, from and to are box names and label is a short tag on the line. At most 12 boxes and 16 links.',
    'boxes は各ボックスの名前（重複不可）と位置（col 1～6、row 1～4、1 マス 1 個）。links の from／to はボックス名、label は線上の短いラベル。最大 12 ボックス・16 本。',
  ),
  keywords: kw(['架構', '資料流', '系統', '元件關係', '流向'], ['architecture', 'data flow', 'system', 'pipeline'], ['構成', 'アーキテクチャ', 'データフロー']),
  props: core.Flow,
  react: { status: 'none', component: null },
  canvas: {
    status: 'full',
    variants: [
      {
        template: 'diagram-flow',
        adapter: 'flow',
        when: null,
        steps: steps(16, '第 i 步點亮第 i 條連線與它兩端的方塊', 'Step i lights link i and the boxes at both ends', 'i ステップ目で i 本目の線と両端のボックスを点灯'),
        limits: {
          boxes: { maxItems: 12 },
          'boxes[].name': { maxLength: 20 },
          'boxes[].col': { maximum: 6 },
          'boxes[].row': { maximum: 4 },
          links: { maxItems: 16 },
          'links[].label': { maxLength: 20 },
          title: { maxLength: 60 },
        },
        props: z.object({}),
      },
    ],
  },
})

export const Scatter = defineComponent({
  id: 'Scatter',
  version: 1,
  category: 'chart',
  name: t('散點圖', 'Scatter plot', '散布図'),
  summary: t('依群組逐一落下的散點，可框出特別的點', 'Points that drop in group by group, with notable points circled', 'グループごとに点が落ち、特別な点を囲む散布図'),
  aiGuide: t(
    'points 每點 x、y 是數字，group 是群組名（最多 6 組），要特別標出的點才填 label（最多 12 個）。最多 80 點。',
    'Each point has numeric x and y and a group name (up to 6 groups); give a label only to points worth calling out (up to 12). At most 80 points.',
    '各点は数値の x・y とグループ名（最大 6 グループ）。目立たせたい点だけ label を付ける（最大 12）。最大 80 点。',
  ),
  keywords: kw(['散點', '分布', '群集', '離群值'], ['scatter', 'distribution', 'clusters', 'outliers'], ['散布図', '分布', '外れ値']),
  props: core.Scatter,
  react: { status: 'none', component: null },
  canvas: {
    status: 'full',
    variants: [
      {
        template: 'diagram-scatter',
        adapter: 'scatter',
        when: null,
        steps: steps(7, '第 i 步落下第 i 個群組的點；群組數之後的一步框出有標籤的點', 'Step i drops the points of group i; the step after the last group circles the labelled points', 'i ステップ目で i 番目のグループの点を落とす。最後のグループの次のステップでラベル付きの点を囲む'),
        limits: { points: { maxItems: 80 }, 'points[].group': { maxLength: 20 }, 'points[].label': { maxLength: 20 }, title: { maxLength: 60 }, xLabel: { maxLength: 20 }, yLabel: { maxLength: 20 } },
        props: z.object({}),
      },
    ],
  },
})

export const Metaphor = defineComponent({
  id: 'Metaphor',
  version: 1,
  category: 'structure',
  name: t('動態隱喻', 'Metaphor', 'たとえ図'),
  summary: t('漏斗、天平或齒輪的動態比喻', 'An animated funnel, balance scale or set of gears', 'じょうご・天秤・歯車の動くたとえ'),
  aiGuide: t(
    'kind 選 funnel（多個輸入濾成少數輸出）、scale（兩邊比重量）或 gears（幾件事連動）。funnel：inputs 最多 8 項、outputs 最多 3 項；scale：inputs 是左盤、outputs 是右盤，各最多 5 項，weight 是重量（省略當 1）；gears：inputs 最多 5 個齒輪，outputs 填 null。',
    'kind is funnel (many inputs filtered into a few outputs), scale (weigh two sides) or gears (things that drive each other). funnel: up to 8 inputs and 3 outputs; scale: inputs is the left pan and outputs the right pan, up to 5 each, with weight (default 1); gears: up to 5 gears in inputs and outputs set to null.',
    'kind は funnel（多くの入力を少数の出力に絞る）、scale（左右の重さ比べ）、gears（連動する物事）。funnel：inputs 最大 8・outputs 最大 3。scale：inputs が左の皿、outputs が右の皿で各最大 5、weight は重さ（省略時 1）。gears：inputs に最大 5 個の歯車、outputs は null。',
  ),
  keywords: kw(['漏斗', '天平', '齒輪', '比喻', '取捨', '連動'], ['funnel', 'scale', 'gears', 'metaphor', 'trade-off'], ['じょうご', '天秤', '歯車', 'たとえ']),
  props: core.Metaphor,
  react: { status: 'none', component: null },
  canvas: {
    status: 'full',
    variants: [
      {
        template: 'diagram-metaphor',
        adapter: 'metaphor',
        when: null,
        steps: steps(5, '漏斗：第 1 步輸入落下、第 2 步輸出冒出；天平：第 1、2 步放上左右盤；齒輪：第 i 步加入第 i 個齒輪', 'Funnel: step 1 drops the inputs, step 2 emits the outputs; scale: steps 1 and 2 load the left and right pans; gears: step i adds gear i', 'じょうご：1 ステップ目で入力が落ち、2 ステップ目で出力が出る。天秤：1・2 ステップ目で左右の皿に載せる。歯車：i ステップ目で i 番目の歯車を追加'),
        limits: { 'inputs.items': { maxItems: 8 }, 'outputs.items': { maxItems: 5 }, '*.title': { maxLength: 20 }, '*.items[].label': { maxLength: 20 }, title: { maxLength: 60 } },
        props: z.object({}),
      },
    ],
  },
})
