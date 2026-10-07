export default function FieldError({ id, error }: { id: string; error?: string | string[] }) {
  const message = Array.isArray(error) ? error[0] : error
  if (!message) return null

  return (
    <p id={id} className="mt-1 text-sm text-danger">
      {message}
    </p>
  )
}
