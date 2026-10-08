import { Head, useForm, usePage } from '@inertiajs/react'
import type { Page } from '@inertiajs/core'
import type { FormEvent } from 'react'

import { CurrentPasswordField, EmailField, NewPasswordField } from '@/components/AuthFields'
import { callout, card, dangerButton, pageHeading, primaryButton } from '@/components/ui'

const sectionHeading = 'text-lg font-semibold'

// Successes reload the page with a notice at the top, so scroll up to show it;
// errors stay next to the form that has them.
const keepScrollOnErrors = (page: Page) => Object.keys(page.props.errors).length > 0

export default function AccountSettings() {
  const user = usePage().props.current_user!

  return (
    <>
      <Head title="Account" />
      <h1 className={pageHeading}>Account</h1>

      {user.demo ? (
        <div className={`${callout} mt-6`}>
          <p>
            You're signed in as <span className="font-semibold">{user.email_address}</span>, the shared demo account. Its
            email and password can't be changed, and it can't be deleted.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <EmailForm currentEmail={user.email_address} />
          <PasswordForm />
          <DeleteAccountForm />
        </div>
      )}
    </>
  )
}

function EmailForm({ currentEmail }: { currentEmail: string }) {
  const { data, setData, patch, processing, errors, reset } = useForm({
    email_address: currentEmail,
    current_password: '',
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    patch('/account/email', { preserveScroll: keepScrollOnErrors, onFinish: () => reset('current_password') })
  }

  return (
    <section aria-labelledby="email-heading" className={card}>
      <h2 id="email-heading" className={sectionHeading}>
        Email
      </h2>
      <form onSubmit={handleSubmit} className="mt-3 space-y-4" noValidate>
        <EmailField
          value={data.email_address}
          onChange={(value) => setData('email_address', value)}
          error={errors.email_address}
        />
        <CurrentPasswordField
          id="email-current-password"
          value={data.current_password}
          onChange={(value) => setData('current_password', value)}
          error={errors.current_password}
        />
        <button
          type="submit"
          disabled={processing || data.email_address.trim().toLowerCase() === currentEmail}
          className={primaryButton}
        >
          Change email
        </button>
      </form>
    </section>
  )
}

function PasswordForm() {
  const { data, setData, patch, processing, errors, reset } = useForm({ current_password: '', password: '' })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    patch('/account/password', { preserveScroll: keepScrollOnErrors, onFinish: () => reset() })
  }

  return (
    <section aria-labelledby="password-heading" className={card}>
      <h2 id="password-heading" className={sectionHeading}>
        Password
      </h2>
      <p className="mt-1 text-sm text-muted">You'll stay signed in here. Other devices will be signed out.</p>
      <form onSubmit={handleSubmit} className="mt-3 space-y-4" noValidate>
        <CurrentPasswordField
          id="password-current-password"
          value={data.current_password}
          onChange={(value) => setData('current_password', value)}
          error={errors.current_password}
        />
        <NewPasswordField
          label="New password"
          value={data.password}
          onChange={(value) => setData('password', value)}
          error={errors.password}
        />
        <button type="submit" disabled={processing} className={primaryButton}>
          Change password
        </button>
      </form>
    </section>
  )
}

function DeleteAccountForm() {
  const { data, setData, delete: destroy, processing, errors, reset } = useForm({ current_password: '' })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (window.confirm("Delete your account? Your recipes and meal plans will be gone for good.")) {
      destroy('/account', { preserveScroll: keepScrollOnErrors, onFinish: () => reset() })
    }
  }

  return (
    <section aria-labelledby="delete-heading" className={card}>
      <h2 id="delete-heading" className={`${sectionHeading} text-danger`}>
        Delete account
      </h2>
      <p className="mt-1 text-sm text-muted">
        This deletes your account along with all your recipes, ingredients, and meal plans. It can't be undone.
      </p>
      <form onSubmit={handleSubmit} className="mt-3 space-y-4" noValidate>
        <CurrentPasswordField
          id="delete-current-password"
          value={data.current_password}
          onChange={(value) => setData('current_password', value)}
          error={errors.current_password}
        />
        <button type="submit" disabled={processing} className={dangerButton}>
          Delete my account
        </button>
      </form>
    </section>
  )
}
