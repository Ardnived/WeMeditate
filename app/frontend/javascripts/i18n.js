
// Taken from https://www.30secondsofcode.org/js/s/deep-get
const deepGet = (obj, keys) =>
  keys.reduce(
    (xs, x) => (xs && xs[x] !== null && xs[x] !== undefined ? xs[x] : null),
    obj
  )

export const translate = function(key, args) {
  let result = deepGet(window.translations, key.split('.'))

  if (!result) {
    console.error('Failed to find translation for', key) // eslint-disable-line no-console
  }

  for (const key in args) {
    result = result.replace(`%{${key}}`, args[key])
  }

  return result
}

export const locale = () => window.locale

export default {
  locale: locale,
  t: translate,
}
