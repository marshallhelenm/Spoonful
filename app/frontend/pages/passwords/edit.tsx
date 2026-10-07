import { useForm } from '@inertiajs/react'
import type { FormEvent } from 'react'

import AuthCard from '@/components/AuthCard'
import { NewPasswordField } from '@/components/AuthFields'
import { primaryButton } from '@/components/ui'

export default function ChooseNewPassword({ token }: { token: string }) {
  const { data, setData, put, processing, errors } = useForm({ password: '' })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    put(`/passwords/${encodeURIComponent(token)}`)
  }

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <NewPasswordField
          label="New password"
          value={data.password}
          onChange={(value) => setData('password', value)}
          error={errors.password}
        />
        <button type="submit" disabled={processing} className={`${primaryButton} w-full`}>
          Save new password
        </button>
      </form>
    </AuthCard>
  )
}
