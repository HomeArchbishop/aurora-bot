import { logger } from './logger'
import { db } from './db'
import App from './app'
// import { everyMinSend198MsgFactory } from './jobs/everyMinSend198Msg'
// import { onlyEchoMe } from './middlewares/onlyEchoMe'
// import { forwardEveryEmotion } from './middlewares/forwardEveryEmotion'
import { reportConnect } from './middlewares/reportConnect'
import { tiichermate } from './jobs/tiichermate'
import { tiichermateController } from './middlewares/tiichermateController'
import { emotion2image } from './middlewares/emotion2image'
import { checkConn } from './middlewares/checkConn'
import { fasongChatBot, fasong2ChatBot } from './middlewares/fasongChatBot'
import { checkVersion } from './middlewares/checkVersion'
// import { onlyEchoMeAndSendID } from './middlewares/onlyEchoMeAndSendID'
// import { fasong2ChatBot } from './middlewares/fasong2ChatBot'
// import { accelerateGif } from './middlewares/accelerateGif'

const app = new App({
  url: process.env.NAPCAT_WS_URL,
  logger,
  db
})

app
  /* system middlewares */
  .useMw(reportConnect)
  .useMw(checkConn)
  .useMw(checkVersion)

  /* applications */
  .useMw(emotion2image)
  // .useMw(onlyEchoMeAndSendID)
  // .useMw(onlyEchoMe)
  // .useMw(accelerateGif)
  // .useMw(forwardEveryEmotion)
  // .useJob(...everyMinSend198MsgFactory())

  /* teachermate */
  .useMw(tiichermateController)
  .useJob(...tiichermate())

  /* chat bot */
  .useMw(fasongChatBot)
  .useMw(fasong2ChatBot)

db.open()
  .then(() => { app.start() })
  .catch(() => {
    process.exit(1)
  })
