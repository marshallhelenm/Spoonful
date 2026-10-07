import { Link, useForm } from '@inertiajs/react'
import type { FormEvent } from 'react'

import AuthCard from '@/components/AuthCard'
import { EmailField, NewPasswordField } from '@/components/AuthFields'
import { primaryButton } from '@/components/ui'

export default function SignUp() {
  const { data, setData, post, processing, errors } = useForm({ email_address: '', password: '' })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    post('/sign_up')
  }

  return (
    <AuthCard title="Create your account" intro="Your recipes and plans are private to you.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <EmailField
          value={data.email_address}
          onChange={(value) => setData('email_address', value)}
          error={errors.email_address}
        />
        <NewPasswordField
          label="Password"
          value={data.password}
          onChange={(value) => setData('password', value)}
          error={errors.password}
        />
        <button type="submit" disabled={processing} className={`${primaryButton} w-full`}>
          Create account
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/session/new" className="font-semibold text-accent-ink underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  )
}
