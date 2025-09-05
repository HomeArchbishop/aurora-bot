declare module 'bun' {
  interface Env {
    VERSION: string
    NAPCAT_WS_URL: string
    MASTER_ID: string
    WEBHOOK_TOKEN?: string
    LLM_API_HOST: string
    LLM_API_KEYS: string
    CHATBOT_FASONG_MASTER_ID: string
    CHATBOT_FASONG_MASTER_NAME: string
    CHATBOT_GROUP_IDS: string
    SERVICE_BINGYAN_CVS_USERNAME: string
    SERVICE_BINGYAN_CVS_PASSWORD: string
    SERVICE_BINGYAN_CVS_PERIOD: string
  }
}
