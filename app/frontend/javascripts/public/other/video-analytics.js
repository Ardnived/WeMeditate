export default class VideoAnalytics {

  constructor(player, localTitle, globalTitle) {
    console.log('Init Video Analytics', localTitle, player)

    this.localTitle = localTitle
    this.globalTitle = globalTitle
    this.player = player

    this.lastTimeUpdate = null
    this.totalWatchedTime = 0
    this.lastReportedImpression = 0
    this.lastReportedTotal = 0
    this.reportingInterval = 5 // Percent

    player.addEventListener('timeupdate', _event => this.onTimeUpdate(), false)
    player.addEventListener('play', _event => this.onPlay(), false)
    player.addEventListener('pause', _event => this.onPause(), false)
    player.addEventListener('seeked', _event => this.onSeek(), false)
  }

  onTimeUpdate() {
    if (this.player.seeking) return

    const currentPercentage = this.getCurrentPercentage()
    if (Math.floor(currentPercentage / this.reportingInterval) != this.lastReportedImpression) {
      this.lastReportedImpression = Math.floor(currentPercentage / this.reportingInterval)

      this.sendEvent('Video Impression', {
        time: (this.lastReportedImpression * this.reportingInterval / 100.0) * this.player.duration,
        percentage: this.lastReportedImpression * this.reportingInterval,
      })
    }

    if (this.lastTimeUpdate) {
      this.totalWatchedTime += this.player.currentTime - this.lastTimeUpdate
    }

    this.lastTimeUpdate = this.player.currentTime

    const totalPercentage = this.getTotalPercentageWatched()
    if (Math.floor(totalPercentage / this.reportingInterval) != this.lastReportedTotal) {
      this.lastReportedTotal = Math.floor(totalPercentage / this.reportingInterval)

      this.sendEvent('Video Progress', {
        time: this.getTotalTimeWatched(),
        percentage: this.getTotalPercentageWatched(),
      })
    }

    if (currentPercentage >= 95 && totalPercentage >= 95) {
      this.sendEvent('Video Completed')
    }
  }

  onPlay() {
    this.lastTimeUpdate = null
    if (this.player.seeking) return

    this.sendEvent('Video Played')
  }

  onPause() {
    this.lastTimeUpdate = this.player.currentTime
    if (this.player.seeking) return
    
    this.sendEvent('Video Paused')
  }

  onSeek() {
    this.sendEvent('Video Seeked')
  }

  sendEvent(name, overrides = {}) {
    let data = {
      event: name,
      globalTitle: this.globalTitle,
      localTitle: this.localTitle,
      time: this.getCurrentTime(),
      percentage: this.getCurrentPercentage(),
    }

    Object.assign(data, overrides)

    console.log('Video Analytics Event', data) // eslint-disable-line no-console
    window.dataLayer.push(data)
  }

  getCurrentPercentage() {
    return parseInt(this.player.currentTime / this.player.duration * 100.0)
  }

  getCurrentTime() {
    return this.player.currentTime.toFixed(1)
  }

  getTotalPercentageWatched() {
    return parseInt(this.totalWatchedTime / this.player.duration * 100.0)
  }

  getTotalTimeWatched() {
    return this.totalWatchedTime.toFixed(1)
  }

}
