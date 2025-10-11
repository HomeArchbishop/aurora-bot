import { App } from 'aurorax'
// import { everyMinSend198Msg } from './jobs/everyMinSend198Msg'
// import { onlyEchoMe } from './middlewares/onlyEchoMe'
// import { forwardEveryEmotion } from './middlewares/forwardEveryEmotion'
import { reportConnect } from './middlewares/reportConnect'
import { tiichermate } from './jobs/tiichermate'
import { tiichermateController } from './middlewares/tiichermateController'
import { emotion2image } from './middlewares/emotion2image'
import { checkConn } from './middlewares/checkConn'
import { fasongChatBot, fasong2ChatBot } from './middlewares/fasongChatBot'
import { checkVersion } from './middlewares/checkVersion'
import { checkKeyUsage } from './middlewares/checkKeyUsage'
import { sendHi } from './webhooks/sendHi'
import { ledger } from './webhooks/ledger'
import { vnEvent } from './jobs/vnEvent'
import { vnReleaseEvent } from './middlewares/vnReleaseEvent'
import { bingyanCvs } from './jobs/bingyanCvs'
// import { onlyEchoMeAndSendID } from './middlewares/onlyEchoMeAndSendID'
// import { fasong2ChatBot } from './middlewares/fasong2ChatBot'
// import { accelerateGif } from './middlewares/accelerateGif'

import './db'
import './tempdir'
import { hajimi } from './middlewares/hajimi'

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

  /* teachermate */
  .useMw(tiichermateController)
  .useJob(...tiichermate)

  .useJob(...bingyanCvs)

  /* chat bot */
  .useMw(fasongChatBot)
  .useMw(fasong2ChatBot)

  .useWebhook(...sendHi)
  .useWebhook(...ledger)

  .start()
