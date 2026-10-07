// Rails sends a list of messages per field; show the first.
export function errorMessage(error?: string | string[]) {
  return Array.isArray(error) ? error[0] : error
}

export default function FieldError({ id, error }: { id: string; error?: string | string[] }) {
  const message = errorMessage(error)
  if (!message) return null

  return (
    <p id={id} className="mt-1 text-sm text-danger">
      {message}
    </p>
  )
}
