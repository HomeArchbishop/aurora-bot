export const buildUrl = (baseUrl: string, path: string): string => {
  return baseUrl.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '')
}
