import Field from '@/components/Field'
import PasswordInput from '@/components/PasswordInput'
import { input } from '@/components/ui'

type FieldProps = {
  value: string
  onChange: (value: string) => void
  error?: string | string[]
}

// Email field shared by the sign-in, sign-up, and password reset pages.
export function EmailField({ value, onChange, error }: FieldProps) {
  return (
    <Field id="email_address" label="Email" error={error}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          type="email"
          autoComplete="email"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={input}
          required
        />
      )}
    </Field>
  )
}

// Choosing a password, on sign-up and password reset.
export function NewPasswordField({ label, value, onChange, error }: FieldProps & { label: string }) {
  return (
    <Field id="password" label={label} hint="At least 8 characters." error={error}>
      {({ id, describedBy, invalid }) => (
        <PasswordInput
          id={id}
          value={value}
          onChange={onChange}
          autoComplete="new-password"
          describedBy={describedBy}
          invalid={invalid}
        />
      )}
    </Field>
  )
}

// Confirming it's really you before an account change. Takes an id because
// the account page has several of these, one per form.
export function CurrentPasswordField({ id, value, onChange, error }: FieldProps & { id: string }) {
  return (
    <Field id={id} label="Current password" error={error}>
      {({ id, describedBy, invalid }) => (
        <PasswordInput
          id={id}
          value={value}
          onChange={onChange}
          autoComplete="current-password"
          describedBy={describedBy}
          invalid={invalid}
        />
      )}
    </Field>
  )
}
