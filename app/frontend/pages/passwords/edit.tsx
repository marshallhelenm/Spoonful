import { useForm } from '@inertiajs/react'
import type { FormEvent } from 'react'

import AuthCard from '@/components/AuthCard'
import FieldError from '@/components/FieldError'
import PasswordInput from '@/components/PasswordInput'
import { label, primaryButton } from '@/components/ui'

export default function ChooseNewPassword({ token }: { token: string }) {
  const { data, setData, put, processing, errors } = useForm({ password: '' })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    put(`/passwords/${encodeURIComponent(token)}`)
  }

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="password" className={label}>
            New password
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
          Save new password
        </button>
      </form>
    </AuthCard>
  )
}
