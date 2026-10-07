// Matching typed ingredient names against the saved ones, to cut down on
// duplicates like "Tomato" / "tomatoes" / "tomatoe".

// Lowercase, strip accents and punctuation, collapse spaces: "Jalapeño  Peppers!" -> "jalapeno peppers"
export function normalize(name: string) {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// Rough English singular for one word: berries -> berry, tomatoes -> tomato, beans -> bean.
function singularWord(word: string) {
  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`
  if (word.length > 4 && /(oes|ses|xes|zes|ches|shes)$/.test(word)) return word.slice(0, -2)
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1)
  return word
}

// A comparison key that ignores case, punctuation, and plurals.
export function matchKey(name: string) {
  return normalize(name).split(' ').map(singularWord).join(' ')
}

// Edit distance counting insertions, deletions, substitutions, and swapped neighbours.
export function editDistance(a: string, b: string) {
  const rows = a.length + 1
  const cols = b.length + 1
  const d: number[][] = Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)))

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
      }
    }
  }
  return d[a.length][b.length]
}

// How many typos to tolerate: none for very short names, where one letter
// often makes a different word ("rice" / "ice").
function allowedEdits(key: string) {
  if (key.length < 5) return 0
  if (key.length < 9) return 1
  return 2
}

function isTypoOf(typedKey: string, savedKey: string) {
  const allowed = allowedEdits(typedKey)
  return allowed > 0 && editDistance(typedKey, savedKey) <= allowed
}

// Saved names to suggest while typing, best first: names starting with the
// text, then names with a word starting with it, then anywhere, then
// plural matches ("tomatos" -> "Diced tomatoes"), then typos.
export function suggestIngredients(typed: string, savedNames: string[], limit = 6) {
  const query = normalize(typed)
  if (!query) return []
  const queryKey = matchKey(typed)

  const ranked: { name: string; rank: number }[] = []
  for (const name of savedNames) {
    const candidate = normalize(name)
    const candidateKey = matchKey(name)
    let rank: number | null = null
    if (candidate.startsWith(query)) rank = 0
    else if (candidate.split(' ').some((word) => word.startsWith(query))) rank = 1
    else if (candidate.includes(query)) rank = 2
    else if (candidateKey.split(' ').some((word) => word.startsWith(queryKey))) rank = 3
    else if (isTypoOf(queryKey, candidateKey)) rank = 4
    if (rank !== null) ranked.push({ name, rank })
  }

  return ranked
    .sort((a, b) => a.rank - b.rank || a.name.length - b.name.length || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map(({ name }) => name)
}

// If `typed` isn't a saved name but is very close to one (plural, typo),
// returns that saved name so the user can be asked "did you mean …?".
// Case-only differences return null: the server already treats those as the same.
export function findNearMatch(typed: string, savedNames: string[]) {
  const typedNormal = normalize(typed)
  if (!typedNormal) return null
  if (savedNames.some((name) => normalize(name) === typedNormal)) return null

  const typedKey = matchKey(typed)
  let best: { name: string; distance: number } | null = null
  for (const name of savedNames) {
    const savedKey = matchKey(name)
    const distance = savedKey === typedKey ? 0 : editDistance(typedKey, savedKey)
    if (distance > 0 && !isTypoOf(typedKey, savedKey)) continue
    if (!best || distance < best.distance) best = { name, distance }
  }
  return best?.name ?? null
}
