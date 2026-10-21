import { App } from 'aurorax'
import { reportConnect } from './middlewares/report-connect'
import { heartbeatWatch } from './middlewares/heartbeat-watch'
import { tiichermate } from './jobs/tiichermate'
import { tiichermateController } from './middlewares/tiichermate-controller'
import { checkConn } from './middlewares/check-conn'
import { fasongChatBot, fasong2ChatBot } from './middlewares/fasong-chatbot'
import { checkVersion } from './middlewares/check-version'
import { createAppInfoMw } from './middlewares/app-info'
import { checkKeyUsage } from './middlewares/check-key-usage'
import { sendHi } from './webhooks/send-hi'
import { ledger } from './webhooks/ledger'
import { vnEvent } from './jobs/vn-event'
import { vnReleaseEvent } from './middlewares/vn-release-event'
import { taffyLive } from './jobs/taffy-live'

import './db'
import './tempdir'
import { dbManager } from './middlewares/db-manager'
import { delegateMsg } from './middlewares/delegate-msg'
import { correctWork } from './middlewares/correct-work'
import { whatsFuckingThis } from './middlewares/whats-fucking-this'
import { taffySay } from './middlewares/taffy-say'
import { ppioBill } from './middlewares/ppio-bill'
import { send2minArticle } from './jobs/send-2min-article'
import { send2minArticleMw } from './middlewares/send-2min-article'
import { registerConnectionLifecycle } from './lifecycle/connection-notify'

const app = new App({
  onebot: {
    type: 'ws-reverse',
    url: process.env.NAPCAT_WS_URL,
    token: process.env.NAPCAT_WS_TOKEN,
  },
  webhook: {
    port: 10721,
    tokens: [process.env.WEBHOOK_TOKEN].filter(Boolean) as string[],
  },
})

registerConnectionLifecycle(app)

app
  /* system middlewares */
  .useMw(heartbeatWatch)
  .useMw(reportConnect)
  .useMw(checkConn)
  .useMw(checkVersion)
  .useMw(createAppInfoMw(app))
  /* applications */
  .useMw(checkKeyUsage)
  .useJob(...vnEvent)
  .useMw(vnReleaseEvent)
  .useJob(...taffyLive)
  .useMw(dbManager)
  .useMw(delegateMsg)
  .useMw(correctWork)
  .useMw(whatsFuckingThis)
  .useMw(taffySay)
  .useMw(send2minArticleMw)
  .useMw(ppioBill)
  /* teachermate */
  .useMw(tiichermateController)

  .useJob(...tiichermate)
  .useJob(...send2minArticle)

  /* chat bot */
  .useMw(fasongChatBot)
  .useMw(fasong2ChatBot)

  .useWebhook(...sendHi)
  .useWebhook(...ledger)

  .start()
