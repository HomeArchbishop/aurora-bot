import { App } from 'aurorax'
// import { feishuDeeplink } from './middlewares/feishu-deeplink'
// import { everyMinSend198Msg } from './jobs/everyMinSend198Msg'
// import { onlyEchoMe } from './middlewares/onlyEchoMe'
// import { forwardEveryEmotion } from './middlewares/forwardEveryEmotion'
import { reportConnect } from './middlewares/report-connect'
import { heartbeatWatch } from './middlewares/heartbeat-watch'
import { tiichermate } from './jobs/tiichermate'
import { tiichermateController } from './middlewares/tiichermate-controller'
import { emotion2image } from './middlewares/emotion-to-image'
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
// import { bingyanCvs } from './jobs/bingyan-cvs'
// import { onlyEchoMeAndSendID } from './middlewares/onlyEchoMeAndSendID'
// import { fasong2ChatBot } from './middlewares/fasong2ChatBot'
// import { accelerateGif } from './middlewares/accelerateGif'

import './db'
import './tempdir'
import { hajimi } from './middlewares/hajimi'
import { dbManager } from './middlewares/db-manager'
import { taffyLiveAsk } from './middlewares/taffy-live-ask'
import { staticQa } from './middlewares/static-qa'
import { attackOn } from './middlewares/attack-on'
import { delegateMsg } from './middlewares/delegate-msg'
import { correctWork } from './middlewares/correct-work'
import { whatsFuckingThis } from './middlewares/whats-fucking-this'
import { taffySay } from './middlewares/taffy-say'
import { ppioBill } from './middlewares/ppio-bill'
import { sendZcMsg } from './jobs/send-zc-msg'
import { send2minArticle } from './jobs/send-2min-article'
import { send2minArticleMw } from './middlewares/send-2min-article'
import { registerConnectionLifecycle } from './lifecycle/connection-notify'
// import { dprkAriticle } from './jobs/dprk-ariticle'

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
  .useMw(hajimi)
  /* applications */
  .useMw(emotion2image)
  // .useMw(onlyEchoMeAndSendID)
  // .useMw(onlyEchoMe)
  // .useMw(accelerateGif)
  // .useMw(forwardEveryEmotion)
  // .useJob(...everyMinSend198Msg)
  .useMw(checkKeyUsage)
  .useJob(...vnEvent)
  .useMw(vnReleaseEvent)
  // .useJob(...bingyanCvs)
  .useJob(...taffyLive)
  .useMw(taffyLiveAsk)
  .useMw(dbManager)
  // .useMw(feishuDeeplink)
  .useMw(staticQa)
  .useMw(attackOn)
  .useMw(delegateMsg)
  .useMw(correctWork)
  .useMw(whatsFuckingThis)
  .useMw(taffySay)
  .useMw(send2minArticleMw)
  // .useJob(...dprkAriticle)
  .useMw(ppioBill)
  /* teachermate */
  .useMw(tiichermateController)
  .useJob(...tiichermate)
  .useJob(...sendZcMsg)
  .useJob(...send2minArticle)

  /* chat bot */
  .useMw(fasongChatBot)
  .useMw(fasong2ChatBot)

  .useWebhook(...sendHi)
  .useWebhook(...ledger)

  .start()
