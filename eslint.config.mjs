import neostandard from 'neostandard'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  ...neostandard({
    ts: true,
  }),
  globalIgnores(['dist/**/*.js']),
  {
    rules: {
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
    },
  },
])
