export default class CountdownTimer {

  constructor(element) {
    this.container = element

    this.targetDate = new Date(parseFloat(element.dataset.time)).getTime()
    this.days = element.querySelector('.js-countdown-days')
    this.hours = element.querySelector('.js-countdown-hours')
    this.minutes = element.querySelector('.js-countdown-minutes')
    this.seconds = element.querySelector('.js-countdown-seconds')
    
    this.interval = setInterval(() => this.update(), 1000)

    const params = new URLSearchParams(window.location.search)
    if (params.has('live')) {
      const live = params.get('live') == 'true'
      this.setMode(live ? 'live' : 'countdown')
    } else {
      const now = Date.now()
      const duration = parseFloat(element.dataset.duration)
      const timeUntilStart = this.targetDate - now
      const timeUntilEnd = this.targetDate + duration - now
      const live = timeUntilStart < 300000 && timeUntilEnd > 0
      this.setMode(live ? 'live' : 'countdown')
    }

    this.update()
    this.container.classList.remove('content__splash__countdown--hidden')
  }

  update() {
    const now = Date.now()
    const t = this.targetDate - now
    const days = Math.floor(t / (1000 * 60 * 60 * 24))
    const hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((t % (1000 * 60)) / 1000)

    this.days.innerText = days < 10 ? `0${days}` : days
    this.hours.innerText = hours < 10 ? `0${hours}` : hours
    this.minutes.innerText = minutes < 10 ? `0${minutes}` : minutes  
    this.seconds.innerText = seconds < 10 ? `0${seconds}` : seconds
    
    if (days == 0 && this.days.dataset.value != 0) {
      this.days.setAttribute('data-value', 0)
    }

    if (t < 300000 && t > 0) { // Less than 5 minutes
      clearInterval(this.interval)
      this.setMode('live')
      //window.location.reload()
    }
  }

  setMode(mode) {
    const opposite = (mode == 'live' ? 'countdown' : 'live')
    const wrapper = this.container.parentNode.parentNode.parentNode
    wrapper.classList.remove(`content__splash--${opposite}`)
    wrapper.classList.add(`content__splash--${mode}`)
  }

}
