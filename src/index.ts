import { App } from 'aurorax'
// import { feishuDeeplink } from './middlewares/feishu-deeplink'
// import { everyMinSend198Msg } from './jobs/everyMinSend198Msg'
// import { onlyEchoMe } from './middlewares/onlyEchoMe'
// import { forwardEveryEmotion } from './middlewares/forwardEveryEmotion'
import { reportConnect } from './middlewares/report-connect'
import { tiichermate } from './jobs/tiichermate'
import { tiichermateController } from './middlewares/tiichermate-controller'
import { emotion2image } from './middlewares/emotion-to-image'
import { checkConn } from './middlewares/check-conn'
import { fasongChatBot, fasong2ChatBot } from './middlewares/fasong-chatbot'
import { checkVersion } from './middlewares/check-version'
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

app
  /* system middlewares */
  .useMw(reportConnect)
  .useMw(checkConn)
  .useMw(checkVersion)
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

  /* teachermate */
  .useMw(tiichermateController)
  .useJob(...tiichermate)

  /* chat bot */
  .useMw(fasongChatBot)
  .useMw(fasong2ChatBot)

  .useWebhook(...sendHi)
  .useWebhook(...ledger)

  .start()
