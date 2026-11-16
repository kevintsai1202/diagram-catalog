# diagram-catalog（共用圖解元件目錄）

一份給多個渲染器共用的「圖解元件」規格：元件 id、結構化的 props、每一步的語意、上限、設計 token，以及三語（繁中、英文、日文）的名稱與給 AI 的用法說明。

目錄只描述**元件是什麼、收什麼資料**，不含畫圖的程式。各渲染器自己實作畫法：

| 渲染器 | 說明 | 目錄裡的欄位 |
| --- | --- | --- |
| `react` | 靜態圖文報告（React 元件，圖表用 ECharts 這類函式庫） | `renderers.react` |
| `canvas` | 逐格繪製的動畫範本，每一步可以對到影片裡的某一句話 | `renderers.canvas` |

AI 依目錄輸出「元件 id＋props」的 JSON，渲染器再把它畫出來。AI 產出的是**參數**，不是程式碼。

## 內容

- `src/core.ts`：37 個元件的核心 props（[zod](https://zod.dev) 4），以及巢狀項目的 schema（`KeyFigureItem`、`TreeNode`…）。
- `src/components/*.ts`：每個元件的中繼資料與畫布變體。
- `src/tokens.ts`：設計 token（深色、淺色、圖表色盤）。
- `dist/catalog.json`：由原始碼產生的整份目錄，**進版控**，給沒有 TypeScript／zod 的消費端直接讀。

## 指令

```powershell
npm install
npm run build    # 由原始碼產生 dist/catalog.json
npm run check    # 只比對 dist/catalog.json 是否與原始碼一致
npm test         # 型別檢查＋單元測試（含「dist 與原始碼一致」）
```

改了 `src/` 之後一定要跑 `npm run build`，並把 `dist/catalog.json` 一起提交。

## 分層

共用目錄只放**兩種渲染器都成立的語意**，各產品自己的規則留在自己那邊、各自擴充。

| 層 | 內容 | 放在哪裡 |
| --- | --- | --- |
| 核心 | 元件 id、核心 props、三語名稱與說明、`aiGuide`、關鍵字 | 本目錄的 `props`、`name`… |
| 畫布擴充 | 對到哪個動畫範本、選擇條件、步驟語意、上限、動畫才有的額外欄位 | 本目錄的 `renderers.canvas.variants` |
| 產品擴充 | 例如引用編號、資料來源規則、動畫的時間點與背景選項 | 各產品自己的程式 |

規則：

1. **核心 props 不帶任何渲染器的上限**。上限只寫在畫布變體的 `limits`。
2. **AI 用的完整 schema＝核心 props＋所選變體的畫布擴充**。
3. 核心之外也匯出巢狀項目的 schema，產品才能在項目層加欄位：

```ts
import { core, KeyFigureItem, z } from 'diagram-catalog'

// 例：在每個數字卡加上引用編號
const KeyFigures = core.KeyFigures.extend({
  items: z.array(KeyFigureItem.extend({ source: z.number().int().min(1) })),
})
```

## 一筆元件的格式

```jsonc
"Comparison": {
  "version": 1,                       // 元件自己的版本
  "category": "compare",
  "name":     {"zh-TW": "雙欄對照", "en": "Comparison", "ja": "比較"},
  "summary":  {"zh-TW": "…", "en": "…", "ja": "…"},   // 一句中性的用途說明
  "aiGuide":  {"zh-TW": "…", "en": "…", "ja": "…"},   // 給 AI 的填寫方式
  "keywords": {"zh-TW": ["對照", "比較"], "en": ["compare"], "ja": ["比較"]},
  "props": { /* 核心 props 的 JSON Schema（子集，見下） */ },
  "renderers": {
    "react":  {"status": "full", "component": "Comparison"},
    "canvas": {"status": "full", "variants": [{
      "template": "diagram-compare",  // 動畫範本 id
      "adapter": "compare",           // 消費端把結構化 props 轉成範本參數的轉換程式名稱
      "when": null,                   // 選擇條件
      "steps": {"zh-TW": "第 1 步左欄出現…", "en": "…", "ja": "…", "max": 6},
      "limits": {"left.points": {"maxItems": 12}, "*.points[]": {"maxLength": 120}},
      "props": { /* 畫布擴充欄位的 JSON Schema */ }
    }]}
  }
}
```

### `status`

- `full`：一對一。
- `partial`：能畫，但會掉資訊或受上限限制（例如流程只畫標題、說明略去）。
- `none`：不支援。AI 挑元件時，只看得到對應渲染器 `status` 不是 `none` 的元件。

### `when`（選擇畫布變體）

一個元件可以對到多個動畫範本，所以 `variants` 是陣列。依陣列順序找第一個條件成立的變體：

| 寫法 | 意思 |
| --- | --- |
| `null` | 一定成立（預設變體，放最後） |
| `{"field": "kind", "in": ["bar", "horizontal-bar"]}` | 欄位值在清單內 |
| `{"count": "items", "min": 5, "max": 6}` | 陣列欄位的項目數在範圍內（含端點） |

也可以直接指定範本 id 選變體。`src/catalog.ts` 的 `selectVariant()` 是參考實作。

### `limits`（上限）

鍵是欄位路徑：`a.b` 是巢狀欄位、`items[]` 是陣列的每一項、`rows[][]` 是二維陣列的每一格、`*` 是任一欄位。值的關鍵字與 JSON Schema 同義（`maxLength`、`maxItems`、`minItems`、`minimum`、`maximum`…），另有樹狀欄位用的 `maxNodes`（整棵樹的節點數）、`maxDepth`（層數）、`maxChildren`（每個節點的子節點數）。

### `steps`（步驟語意）

第 i 步會發生什麼，以及最多幾步。動畫渲染器用它決定需要幾個時間點（例如每一步對到影片裡的一句話）。

## JSON Schema 子集

`props` 由 zod 的 `z.toJSONSchema` 產生後再整理，只會出現下列關鍵字（`schemaSubset` 欄位也列出同一份清單），消費端只要實作這些：

- `type`：字串，或 `[型別, "null"]`（可為 null 的欄位）
- `properties`、`required`、`additionalProperties`（只會是 `false`）
- `items`、`minItems`、`maxItems`
- `enum`、`minimum`、`maximum`、`minLength`、`maxLength`
- `$defs`、`$ref`（只用在遞迴的樹狀結構，形如 `#/$defs/TreeNode`）

## 設計 token

只放語意名稱與色值：`bg`、`card`、`line`、`text`、`textMuted`、`primary`、`flow`、`warn`、`bad`、`ok`，深色與淺色各一組，另有 8 色的圖表色盤。AI 與轉換程式只用語意名稱，由渲染器換成色值，**模型不寫色碼**。

## 元件一覽

| 分類 | 元件 |
| --- | --- |
| 版面 | Report、Section、Columns、Slide、Divider、SourceList |
| 文字 | Paragraph、Callout、Highlights、Quote、Footnote、Scenes |
| 順序 | Steps、Timeline、Checklist |
| 數字 | KeyFigures、Delta、Gauge、Ranking、Progress |
| 圖表 | Chart、Heatmap、RegionMap、Scatter |
| 表格與對照 | DataTable、Comparison |
| 圖片 | Figure |
| 程式碼 | CodeCard、CodeMotion、Terminal |
| 結構 | Tree、Decision、Flow、Metaphor |
| 疊加 | Stamp、SocialPost、Subscribe |

前 24 種（Report～SourceList）來自靜態報告渲染器，後 13 種（1.1.0 起多了多拍子場景 `Scenes`）目前只有動畫渲染器有。兩邊目前沒有對應的，標成 `none`。

## 版本

- 目錄版本（`catalogVersion`，與 `package.json` 相同）採 semver：
  - 刪除或改名 props：升 major。
  - 新增元件或選填 props：升 minor。
  - 只改說明或關鍵字：升 patch。
- 每個元件另有自己的 `version`。
- 發版時打 git tag `vX.Y.Z`。消費端依 tag 取用 `dist/catalog.json`，並記下版本與 sha256，檢查檔案沒有被手改。

## 授權

[Apache License 2.0](LICENSE)
