declare namespace NodeJS {
  interface ProcessEnv {
    VERSION: string
    NAPCAT_WS_URL: string
    MASTER_ID: string
    CHATBOT_LLM_API_HOST: string
    CHATBOT_LLM_API_KEYS: string
    CHATBOT_FASONG_MASTER_ID: string
    CHATBOT_FASONG_MASTER_NAME: string
  }
}
