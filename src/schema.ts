import { z } from 'zod'
import type { JsonSchema } from './types.ts'

/**
 * 目錄 JSON 裡 props 允許的 JSON Schema 關鍵字。消費端（例如沒有 JSON Schema 函式庫的 Python／JS）只需要實作這些：
 * - `type`：可以是字串，或 `[型別, "null"]`（可為 null 的欄位）；
 * - `properties`、`required`、`additionalProperties`（只會是 false）；
 * - `items`、`minItems`、`maxItems`；
 * - `enum`、`minimum`、`maximum`、`minLength`、`maxLength`；
 * - `$defs`、`$ref`（只用在遞迴的樹狀結構，形如 `#/$defs/TreeNode`）。
 */
export const SUBSET_KEYWORDS = [
  'type',
  'properties',
  'required',
  'additionalProperties',
  'items',
  'minItems',
  'maxItems',
  'enum',
  'minimum',
  'maximum',
  'minLength',
  'maxLength',
  '$defs',
  '$ref',
] as const

/** zod 對「整數」自動加上的安全整數上下限，不是真的限制，輸出時拿掉。 */
const SAFE_INT = Number.MAX_SAFE_INTEGER

/**
 * 把 zod 物件轉成目錄用的 JSON Schema 子集：
 * 拿掉 `$schema`、`id` 這類中繼欄位與安全整數的哨兵上下限；遇到子集外的關鍵字直接丟錯，避免消費端默默忽略。
 */
export function toSubsetSchema(schema: z.ZodType): JsonSchema {
  const raw = z.toJSONSchema(schema, { target: 'draft-2020-12', unrepresentable: 'throw' }) as Record<string, unknown>
  delete raw.$schema
  return clean(raw, '') as JsonSchema
}

/**
 * zod 把「可為 null 的物件／陣列」輸出成 `anyOf: [X, {type: "null"}]`；子集沒有 anyOf，
 * 所以改寫成 X 本身、`type` 換成 `[X.type, "null"]`（與可為 null 的字串、數字同一種寫法）。
 */
function mergeNullable(node: Record<string, unknown>, path: string): Record<string, unknown> {
  if (!('anyOf' in node)) return node
  const options = node.anyOf as Record<string, unknown>[]
  const rest = Object.keys(node).filter((k) => k !== 'anyOf')
  const nonNull = options.filter((o) => !(o.type === 'null' && Object.keys(o).length === 1))
  if (rest.length || options.length !== 2 || nonNull.length !== 1 || typeof nonNull[0].type !== 'string') {
    throw new Error(`schema ${path || '(根)'} 的 anyOf 只能是「某型別或 null」`)
  }
  const [base] = nonNull
  return { ...base, type: [base.type, 'null'] }
}

/** 遞迴清理一個 schema 節點；`path` 只用在錯誤訊息。 */
function clean(node: Record<string, unknown>, path: string): Record<string, unknown> {
  node = mergeNullable(node, path)
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(node)) {
    if (key === 'id') continue
    if ((key === 'maximum' && value === SAFE_INT) || (key === 'minimum' && value === -SAFE_INT)) continue
    if (!(SUBSET_KEYWORDS as readonly string[]).includes(key)) {
      throw new Error(`schema ${path || '(根)'} 用到子集外的關鍵字 ${key}`)
    }
    if (key === 'additionalProperties' && value !== false) {
      throw new Error(`schema ${path || '(根)'} 的 additionalProperties 只能是 false`)
    }
    if (key === 'properties' || key === '$defs') {
      const children: Record<string, unknown> = {}
      for (const [name, child] of Object.entries(value as Record<string, Record<string, unknown>>)) {
        children[name] = clean(child, `${path}.${name}`)
      }
      out[key] = children
    } else if (key === 'items') {
      out[key] = clean(value as Record<string, unknown>, `${path}[]`)
    } else {
      out[key] = value
    }
  }
  return out
}
