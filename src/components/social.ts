import { z } from 'zod'
import { core } from '../core.ts'
import { defineComponent, kw, steps, t } from '../types.ts'

/** 疊加用的小元件：印章、社群貼文卡、訂閱條（目前只有動畫渲染器有）。 */

export const Stamp = defineComponent({
  id: 'Stamp',
  version: 1,
  category: 'social',
  name: t('印章', 'Stamp', 'スタンプ'),
  summary: t('蓋下「已驗證」「失敗」這類印章，可疊在其他圖解上', 'Stamps a mark such as "Verified" or "Failed", optionally over another diagram', '「確認済み」「失敗」などのスタンプを押す。他の図解に重ねられる'),
  aiGuide: t(
    'text 12 字內；style 用 pass（綠）、fail（紅）、warn（琥珀）、review（紫）。背景預設透明，適合疊在別的圖解上。',
    'text is at most 12 characters; style is pass (green), fail (red), warn (amber) or review (purple). The background is transparent by default, so it works on top of another diagram.',
    'text は 12 文字以内。style は pass（緑）、fail（赤）、warn（琥珀）、review（紫）。背景は既定で透明なので他の図解に重ねられる。',
  ),
  keywords: kw(['印章', '通過', '失敗', '驗證', '蓋章'], ['stamp', 'approved', 'failed', 'verified'], ['スタンプ', '合格', '不合格', '確認済み']),
  props: core.Stamp,
  react: { status: 'none', component: null },
  canvas: {
    status: 'full',
    variants: [
      {
        template: 'diagram-stamp',
        adapter: 'stamp',
        when: null,
        steps: steps(1, '第 1 步蓋章', 'Step 1 stamps the mark', '1 ステップ目でスタンプを押す'),
        limits: { text: { maxLength: 12 }, subtext: { maxLength: 24 } },
        props: z.object({
          rotate: z.number().min(-45).max(45).optional(),
          size: z.number().min(0.5).max(2).optional(),
          pos: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }).optional(),
        }),
      },
    ],
  },
})

export const SocialPost = defineComponent({
  id: 'SocialPost',
  version: 1,
  category: 'social',
  name: t('社群貼文卡', 'Social post', 'SNS 投稿カード'),
  summary: t('通用外觀的社群貼文卡，會浮上來並按讚', 'A generic-looking social post card that floats in and gets a like', '汎用デザインの投稿カード。浮かび上がって「いいね」される'),
  aiGuide: t(
    'style 用 micro（短文貼文）或 forum（論壇貼文，要有 community 與 postTitle）。stats 寫成文字（可用 2.4K 這類縮寫）。不要寫任何真實平台的名稱或標誌，也不要冒用真實人物或帳號。',
    'style is micro (short post) or forum (needs community and postTitle). stats are text and may use abbreviations such as 2.4K. Never name or imitate a real platform, person or account.',
    'style は micro（短文投稿）か forum（community と postTitle が必要）。stats は文字列（2.4K のような略記可）。実在のプラットフォーム名・ロゴや実在の人物・アカウントは使わない。',
  ),
  keywords: kw(['社群', '貼文', '留言', '按讚', '口碑'], ['social post', 'comment', 'like', 'testimonial'], ['投稿', 'SNS', 'いいね', '口コミ']),
  props: core.SocialPost,
  react: { status: 'none', component: null },
  canvas: {
    status: 'full',
    variants: [
      {
        template: 'diagram-social-post',
        adapter: 'social-post',
        when: null,
        steps: steps(2, '第 1 步卡片浮上來、第 2 步按讚', 'Step 1 floats the card in, step 2 likes it', '1 ステップ目でカードが浮かび、2 ステップ目で「いいね」'),
        limits: { name: { maxLength: 30 }, handle: { maxLength: 30 }, community: { maxLength: 30 }, postTitle: { maxLength: 80 }, text: { maxLength: 280 }, time: { maxLength: 20 } },
        props: z.object({ theme: z.enum(['dark', 'light']).optional() }),
      },
    ],
  },
})

export const Subscribe = defineComponent({
  id: 'Subscribe',
  version: 1,
  category: 'social',
  name: t('訂閱條', 'Subscribe bar', '登録バー'),
  summary: t('畫面下方滑入、按下訂閱再滑出的頻道訂閱條', 'A channel subscribe bar that slides in, gets clicked and slides out', '画面下に現れ、登録ボタンが押されて消えるチャンネル登録バー'),
  aiGuide: t(
    'name 是頻道名稱，subscribers 是訂閱人數的文字。button／done 留 null 會用輸出語言的預設文字。',
    'name is the channel name and subscribers is the subscriber count as text. Leave button and done null to use default text in the output language.',
    'name はチャンネル名、subscribers は登録者数の文字列。button／done を null にすると出力言語の既定文言になる。',
  ),
  keywords: kw(['訂閱', '頻道', '追蹤', '片尾'], ['subscribe', 'channel', 'follow', 'outro'], ['チャンネル登録', '登録', 'フォロー']),
  props: core.Subscribe,
  react: { status: 'none', component: null },
  canvas: {
    status: 'full',
    variants: [
      {
        template: 'diagram-subscribe',
        adapter: 'subscribe',
        when: null,
        steps: steps(3, '第 1 步滑入、第 2 步按下訂閱、第 3 步滑出', 'Step 1 slides in, step 2 clicks subscribe, step 3 slides out', '1 ステップ目で表示、2 ステップ目で登録を押し、3 ステップ目で退場'),
        limits: { name: { maxLength: 30 }, subscribers: { maxLength: 30 }, button: { maxLength: 10 }, done: { maxLength: 10 } },
        props: z.object({
          pos: z.enum(['bottom-left', 'bottom-center', 'bottom-right']).optional(),
          cursor: z.boolean().optional(),
          bell: z.boolean().optional(),
        }),
      },
    ],
  },
})
