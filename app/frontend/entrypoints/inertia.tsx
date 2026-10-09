import { createInertiaApp } from '@inertiajs/react'

import Layout from '@/components/Layout'

void createInertiaApp({
  pages: '../pages',

  layout: () => Layout,

  title: (title) => (title ? `${title} · Spoonful` : 'Spoonful'),

  strictMode: true,

  defaults: {
    form: {
      forceIndicesArrayFormatInFormData: false,
      withAllErrors: true,
    },
    visitOptions: () => ({ queryStringArrayFormat: 'brackets' }),
  },
})
