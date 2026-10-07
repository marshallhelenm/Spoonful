import { Link, useForm } from '@inertiajs/react'
import type { FormEvent } from 'react'

import AuthCard from '@/components/AuthCard'
import { EmailField } from '@/components/AuthFields'
import { primaryButton } from '@/components/ui'

export default function ForgotPassword() {
  const { data, setData, post, processing } = useForm({ email_address: '' })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    post('/passwords')
  }

  return (
    <AuthCard title="Reset your password" intro="We'll email you a link to choose a new one.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <EmailField value={data.email_address} onChange={(value) => setData('email_address', value)} />
        <button type="submit" disabled={processing} className={`${primaryButton} w-full`}>
          Send reset link
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        <Link href="/session/new" className="font-semibold text-accent-ink underline">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  )
}
