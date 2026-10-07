// A copy of `set` with `value` added (present) or removed, for React state
// that must not be changed in place.
export function withMember<T>(set: ReadonlySet<T>, value: T, present: boolean): Set<T> {
  const next = new Set(set)
  if (present) next.add(value)
  else next.delete(value)
  return next
}
