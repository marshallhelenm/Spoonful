// Dates arrive from Rails as "YYYY-MM-DD". Parse them as local dates so they
// don't shift a day in timezones behind UTC.
function parseDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDate(isoDate: string) {
  return parseDate(isoDate).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}
