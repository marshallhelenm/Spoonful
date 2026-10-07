// Light/dark theme preference. "system" follows the device setting; the other
// two force a theme by setting <html data-theme>. The choice is saved per
// browser in localStorage (the inline script in application.html.erb applies
// it before the page paints, so there's no flash of the wrong theme).

export type ThemePreference = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'spoonful-theme'

// Browser bar colors, matching --color-surface in each theme.
const THEME_COLORS = { light: '#fffbea', dark: '#2e2414' }

export function getThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : 'system'
  } catch {
    return 'system'
  }
}

export function setThemePreference(preference: ThemePreference) {
  try {
    if (preference === 'system') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, preference)
  } catch {
    // Storage can be unavailable (e.g. private browsing); the choice still applies for this visit.
  }

  const root = document.documentElement
  if (preference === 'system') delete root.dataset.theme
  else root.dataset.theme = preference

  // The two theme-color tags are keyed by the device setting; when the user
  // forces a theme, point both at that theme's color.
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    const scheme = meta.media.includes('dark') ? 'dark' : 'light'
    meta.content = THEME_COLORS[preference === 'system' ? scheme : preference]
  }
}
