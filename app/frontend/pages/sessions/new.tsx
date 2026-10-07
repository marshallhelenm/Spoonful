import { Link, useForm } from '@inertiajs/react'
import type { FormEvent } from 'react'

import AuthCard from '@/components/AuthCard'
import PasswordInput from '@/components/PasswordInput'
import { input, label, primaryButton } from '@/components/ui'

export default function SignIn() {
  const { data, setData, post, processing } = useForm({ email_address: '', password: '' })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    post('/session', { onFinish: () => setData('password', '') })
  }

  return (
    <AuthCard title="Sign in" intro="Plan meals around how many spoons you have this week.">
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className={input}
            required
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className={label}>
              Password
            </label>
            <Link href="/passwords/new" className="text-sm font-semibold text-accent-ink underline">
              Forgot it?
            </Link>
          </div>
          <PasswordInput
            id="password"
            value={data.password}
            onChange={(value) => setData('password', value)}
            autoComplete="current-password"
          />
        </div>
        <button type="submit" disabled={processing} className={`${primaryButton} w-full`}>
          Sign in
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        New here?{' '}
        <Link href="/sign_up" className="font-semibold text-accent-ink underline">
          Create an account
        </Link>
      </p>
    </AuthCard>
  )
}
