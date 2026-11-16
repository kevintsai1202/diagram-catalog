import { z } from 'zod'
import { core } from '../core.ts'
import { defineComponent, kw, steps, t } from '../types.ts'

/** 程式碼與終端機（目前只有動畫渲染器有）。 */

export const CodeCard = defineComponent({
  id: 'CodeCard',
  version: 1,
  category: 'code',
  name: t('程式碼卡片', 'Code card', 'コードカード'),
  summary: t('等寬字的程式碼卡片，逐步強調指定的行', 'A monospaced code card that highlights chosen lines step by step', '指定した行を順に強調する等幅のコードカード'),
  aiGuide: t(
    'code 放原始程式碼（保留換行與縮排）。steps 每步列出要強調的行號（1 起算）。想在某一步放大並加警示時，用畫布擴充的 popupStep 與 popupNote。',
    'Put the source in code, keeping line breaks and indentation. Each step lists the line numbers (1-based) to highlight. To zoom in with a warning on one step, use popupStep and popupNote in the canvas extension.',
    'code にソースコードを改行・インデントごと入れる。steps は各ステップで強調する行番号（1 始まり）。あるステップで拡大して警告を出すなら canvas 拡張の popupStep と popupNote を使う。',
  ),
  keywords: kw(['程式碼', '原始碼', '設定檔', '程式'], ['code', 'source', 'snippet', 'config'], ['コード', 'ソース', '設定ファイル']),
  props: core.CodeCard,
  react: { status: 'none', component: null },
  canvas: {
    status: 'full',
    variants: [
      {
        template: 'diagram-code',
        adapter: 'code',
        when: null,
        steps: steps(20, '第 i 步強調第 i 組行號', 'Step i highlights the lines of step i', 'i ステップ目で i 番目の行群を強調'),
        limits: { code: { maxLength: 1200 }, steps: { maxItems: 20 }, title: { maxLength: 60 }, fileName: { maxLength: 40 }, popupNote: { maxLength: 40 } },
        props: z.object({
          popupStep: z.number().int().min(0).max(8).optional(),
          popupNote: z.string().nullable().optional(),
        }),
      },
    ],
  },
})

export const CodeMotion = defineComponent({
  id: 'CodeMotion',
  version: 1,
  category: 'code',
  name: t('程式碼動畫', 'Code motion', 'コードアニメーション'),
  summary: t('程式碼逐字打出、顯示差異或捲到目標行', 'Code that types itself out, shows a diff, or scrolls to a target line', 'コードを一文字ずつ打つ、差分を見せる、目的の行へスクロールする'),
  aiGuide: t(
    'mode 選 type（逐字打字）、diff（差異）或 scroll（捲到目標行並聚光）。diff 時 code 每行開頭用 + 表示新增、- 表示刪除、空白表示不變。steps 每步列出這一步處理的行號。',
    'mode is type (typed out), diff, or scroll (scroll to and spotlight a line). In diff mode every code line starts with + for added, - for removed, or a space for unchanged. Each step lists the line numbers it covers.',
    'mode は type（タイプ表示）、diff（差分）、scroll（目的の行へスクロールして強調）。diff では code の各行頭を追加なら +、削除なら -、変更なしなら空白にする。steps は各ステップで扱う行番号。',
  ),
  keywords: kw(['打字', '差異', '修改', '捲動', '程式碼'], ['typing', 'diff', 'change', 'scroll', 'code'], ['タイピング', '差分', '変更', 'コード']),
  props: core.CodeMotion,
  react: { status: 'none', component: null },
  canvas: {
    status: 'full',
    variants: [
      {
        template: 'diagram-code-motion',
        adapter: 'code-motion',
        when: null,
        steps: steps(20, '第 i 步進行第 i 段（打字、差異或捲動）', 'Step i plays segment i (typing, diff or scroll)', 'i ステップ目で i 番目の区間（タイプ・差分・スクロール）を再生'),
        limits: { code: { maxLength: 1200 }, steps: { maxItems: 20 }, title: { maxLength: 60 }, fileName: { maxLength: 40 } },
        props: z.object({ cps: z.number().min(4).max(60).optional() }),
      },
    ],
  },
})

export const Terminal = defineComponent({
  id: 'Terminal',
  version: 1,
  category: 'code',
  name: t('終端機', 'Terminal', 'ターミナル'),
  summary: t('終端機視窗裡逐一打出指令並印出結果', 'A terminal window that types commands and prints their output', 'ターミナルでコマンドを打ち、結果を表示する'),
  aiGuide: t(
    'commands 每項一個指令與它的輸出行；輸出行開頭用 ✓ 表示成功、✗ 表示失敗、! 表示警告。prompt 是提示字元（預設 $）。',
    'Each entry is one command and its output lines; start an output line with ✓ for success, ✗ for failure or ! for a warning. prompt is the prompt character (default $).',
    'commands は 1 項目 1 コマンドとその出力行。出力行の先頭は成功なら ✓、失敗なら ✗、警告なら !。prompt はプロンプト文字（既定は $）。',
  ),
  keywords: kw(['終端機', '指令', '命令列', '執行結果'], ['terminal', 'command line', 'shell', 'CLI'], ['ターミナル', 'コマンド', 'シェル']),
  props: core.Terminal,
  react: { status: 'none', component: null },
  canvas: {
    status: 'full',
    variants: [
      {
        template: 'diagram-terminal',
        adapter: 'terminal',
        when: null,
        steps: steps(20, '第 i 步打出第 i 個指令並印出它的輸出', 'Step i types command i and prints its output', 'i ステップ目で i 番目のコマンドを打ち、出力を表示'),
        limits: { commands: { maxItems: 20 }, title: { maxLength: 60 }, windowTitle: { maxLength: 40 }, prompt: { maxLength: 8 } },
        props: z.object({ cps: z.number().min(4).max(60).optional() }),
      },
    ],
  },
})
