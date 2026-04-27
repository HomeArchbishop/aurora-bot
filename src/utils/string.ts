export const splitAndTrimAndFilterEmpty = (str: string, separator: string | RegExp) => {
  return str.split(separator).map(s => s.trim()).filter(s => s.length > 0)
}
