import neostandard from 'neostandard'

export default [
  ...neostandard({
    ts: true,
  }),
  {
    rules: {
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
    },
  },
]
