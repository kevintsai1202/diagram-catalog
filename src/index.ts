/**
 * 共用圖解元件目錄的進入點。
 * - `core`：36 個元件的核心 props（zod），各產品 `.extend()` 加自己的欄位；
 * - 項目層 schema（`KeyFigureItem` 等）：在巢狀項目加欄位用；
 * - `buildCatalog()`／`serializeCatalog()`：產生 dist/catalog.json 的內容；
 * - `selectVariant()`：依 `when` 條件挑畫布變體。
 */
export * from './core.ts'
export { buildCatalog, CATALOG_VERSION, COMPONENTS, selectVariant, serializeCatalog } from './catalog.ts'
export type { CatalogJson } from './catalog.ts'
export { SUBSET_KEYWORDS, toSubsetSchema } from './schema.ts'
export { tokens } from './tokens.ts'
export type { TokenName } from './tokens.ts'
export { LOCALES } from './types.ts'
export type * from './types.ts'
