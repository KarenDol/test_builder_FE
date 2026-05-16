/** Deterministic shuffle so option order stays stable while navigating the test. */
export function seededOptionIndices(seed: string, count: number): number[] {
  if (count <= 1) return Array.from({ length: count }, (_, i) => i)
  let h = 2166136261 >>> 0
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  const indices = Array.from({ length: count }, (_, i) => i)
  const next = () => {
    h ^= h << 13
    h ^= h >>> 7
    h ^= h << 17
    return (h >>> 0) / 0xffffffff
  }
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    const t = indices[i]!
    indices[i] = indices[j]!
    indices[j] = t
  }
  return indices
}
