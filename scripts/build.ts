/**
 * 產生 dist/catalog.json（給沒有 TypeScript／zod 的消費端直接讀）。
 *   npm run build           # 寫檔
 *   npm run check           # 只比對，不一致就以 exit 1 結束
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildCatalog, serializeCatalog } from '../src/index.ts'

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../dist/catalog.json')
const text = serializeCatalog()
const count = Object.keys(buildCatalog().components).length

if (process.argv.includes('--check')) {
  let current = ''
  try {
    current = readFileSync(out, 'utf8')
  } catch {
    // 檔案不存在視為不一致
  }
  if (current !== text) {
    console.error('dist/catalog.json 與原始碼不一致，請執行 npm run build')
    process.exit(1)
  }
  console.log(`dist/catalog.json 與原始碼一致（${count} 個元件）`)
} else {
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, text, 'utf8')
  console.log(`已寫入 dist/catalog.json（${count} 個元件，${Buffer.byteLength(text)} 位元組）`)
}
