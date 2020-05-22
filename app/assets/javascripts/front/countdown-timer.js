/* global */
/* exported CountdownTimer */

class CountdownTimer {

  constructor(element) {
    this.container = element

    this.targetDate = new Date(parseFloat(element.dataset.time)).getTime()
    this.days = element.querySelector('.js-countdown-days')
    this.hours = element.querySelector('.js-countdown-hours')
    this.minutes = element.querySelector('.js-countdown-minutes')
    this.seconds = element.querySelector('.js-countdown-seconds')
    
    console.log('Target countdown time', this.targetDate, 'from', element.dataset.time);

    this.interval = setInterval(() => this.update(), 1000)

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
      window.location.reload()
    }
  }

}
