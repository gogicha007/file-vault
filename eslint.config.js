//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  { ignores: ['src/db.js', 'eslint.config.js', 'prettier.config.js'] },
]
