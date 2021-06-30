
export function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)]
}

export function sendAnalyticsEvent(name, attributes) {
  attributes.event = name
  console.log('Analytics Event', attributes) // eslint-disable-line no-console
  if (typeof window.dataLayer !== 'undefined') window.dataLayer.push(attributes)
}

export function getOrientation() {
  return window.innerWidth > window.innerHeight ? 'horizontal' : 'vertical'
}

export function isMobileDevice() {
  return navigator.userAgent.match(/Android/i)
      || navigator.userAgent.match(/webOS/i)
      || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPad/i)
      || navigator.userAgent.match(/iPod/i)
      || navigator.userAgent.match(/BlackBerry/i)
      || navigator.userAgent.match(/Windows Phone/i)
}

export function isTouchDevice() {
  return ('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)
}