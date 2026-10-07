import { pluralize } from '@/lib/format'

// Read-only spoon rating, e.g. 🥄🥄🥄. Zero-spoon meals show as "No effort".
export default function Spoons({ count }: { count: number }) {
  if (count === 0) {
    return <span className="text-sm font-medium text-success">No effort</span>
  }

  return (
    <span role="img" aria-label={pluralize(count, 'spoon')} className="whitespace-nowrap tracking-tighter">
      {'🥄'.repeat(count)}
    </span>
  )
}
