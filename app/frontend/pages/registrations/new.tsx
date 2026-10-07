import { Link, useForm } from '@inertiajs/react'
import type { FormEvent } from 'react'

import AuthCard from '@/components/AuthCard'
import FieldError from '@/components/FieldError'
import PasswordInput from '@/components/PasswordInput'
import { input, label, primaryButton } from '@/components/ui'

export default function SignUp() {
  const { data, setData, post, processing, errors } = useForm({ email_address: '', password: '' })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    post('/sign_up')
  }

  return (
    <AuthCard title="Create your account" intro="Your recipes and plans are private to you.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email_address" className={label}>
            Email
          </label>
          <input
            id="email_address"
            type="email"
            autoComplete="email"
            value={data.email_address}
            onChange={(event) => setData('email_address', event.target.value)}
            aria-invalid={errors.email_address ? true : undefined}
            aria-describedby={errors.email_address ? 'email_address-error' : undefined}
            className={input}
          />
          <FieldError id="email_address-error" error={errors.email_address} />
        </div>
        <div>
          <label htmlFor="password" className={label}>
            Password
          </label>
          <p id="password-hint" className="text-sm text-muted">
            At least 8 characters.
          </p>
          <PasswordInput
            id="password"
            value={data.password}
            onChange={(value) => setData('password', value)}
            autoComplete="new-password"
            describedBy={errors.password ? 'password-hint password-error' : 'password-hint'}
            invalid={Boolean(errors.password)}
          />
          <FieldError id="password-error" error={errors.password} />
        </div>
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
