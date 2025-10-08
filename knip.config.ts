import type { KnipConfig } from 'knip'

export default {
  ignore: [
    'dist/*',
    'src/middlewares/**/*',
    'src/jobs/**/*',
    'src/webhooks/**/*',
    'src/global.d.ts',
  ],
  ignoreDependencies: ['aurorax'],
} satisfies KnipConfig
