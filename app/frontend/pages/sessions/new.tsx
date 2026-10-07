import { Link, useForm } from '@inertiajs/react'
import type { FormEvent } from 'react'

import AuthCard from '@/components/AuthCard'
import { EmailField } from '@/components/AuthFields'
import Field from '@/components/Field'
import PasswordInput from '@/components/PasswordInput'
import { primaryButton } from '@/components/ui'

export default function SignIn() {
  const { data, setData, post, processing } = useForm({ email_address: '', password: '' })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    post('/session', { onFinish: () => setData('password', '') })
  }

  return (
    <AuthCard title="Sign in" intro="Plan meals around how many spoons you have this week.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <EmailField value={data.email_address} onChange={(value) => setData('email_address', value)} />
        <Field
          id="password"
          label="Password"
          labelAside={
            <Link href="/passwords/new" className="text-sm font-semibold text-accent-ink underline">
              Forgot it?
            </Link>
          }
        >
          {({ id }) => (
            <PasswordInput
              id={id}
              value={data.password}
              onChange={(value) => setData('password', value)}
              autoComplete="current-password"
            />
          )}
        </Field>
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
