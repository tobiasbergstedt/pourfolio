// utils/parse.ts
export const toNum = (v: string) => {
  const n = parseFloat(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : undefined
}

export const toInt = (v: string) => {
  const n = parseInt(String(v ?? '').trim(), 10)
  return Number.isFinite(n) ? n : undefined
}

export const upperAlpha3 = (v: string) =>
  String(v ?? '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 3)
