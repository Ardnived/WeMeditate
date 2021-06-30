import VideoAnalytics from '../other/video-analytics'
import VimeoPlayer from '@vimeo/player'
import { getOrientation } from '../util'

export default class Video {

  constructor(element) {
    this.container = element
    this.responsive = element.classList.contains('video--responsive')
    this.button = element.querySelector('.video__button:not(.video__popup)')
    this.players = element.querySelectorAll('video')

    if (this.players.length > 0) {
      this.analytics = []

      for (let i = 0; i < this.players.length; i++) {
        const player = this.players[i]
        this.analytics[i] = new VideoAnalytics(player, element.dataset.gtmLocal, element.dataset.gtmGlobal)
      }
    }
    
    if (this.button) {
      this.button.innerHTML = '<div class="video__button__loader icon icon--spinner"></div>'
      this.button.addEventListener('click', event => {
        this.initPlayer()
        event.preventDefault()
        return false
      })
    }
  }

  initPlayer() {
    if (this.responsive) {
      this.validateOrientationCallback = () => this.resetOrientation()
      this.horizontalPlayer = this.loadPlayer(this.container.querySelector('.video__horizontal > iframe'))
      this.verticalPlayer = this.loadPlayer(this.container.querySelector('.video__vertical > iframe'))
      this.currentOrientation = getOrientation()
    } else {
      this.horizontalPlayer = this.loadPlayer(this.container.querySelector('iframe'))
    }

    this.button.classList.add('video__button--loading')
    this.container.classList.add('video--active')
    //this.player.play().then(() => {})
  }

  get player() {
    return this.responsive && this.orientation == 'vertical' ? this.verticalPlayer : this.horizontalPlayer
  }

  loadPlayer(iframe) {
    console.log('load vimeo?', iframe.src)
    if (!iframe) return
    iframe.src = iframe.dataset.src
    console.log('load vimeo', iframe.src)
    const player = new VimeoPlayer(iframe)

    player.on('pause', () => {
      if (this.responsive) this.toggleOrientationCheck(false)
    })
    
    player.on('play', () => {
      if (this.responsive) this.toggleOrientationCheck(true)
      this.container.classList.add('video--active')
    })

    return player
  }

  resetOrientation() {
    const newOrientation = getOrientation()
    if (newOrientation == this.orientation) return

    this.orientation = newOrientation
    const oldPlayer = this.orientation == 'horizontal' ? this.verticalPlayer : this.horizontalPlayer
    const newPlayer = this.orientation == 'vertical' ? this.horizontalPlayer : this.verticalPlayer

    oldPlayer.getCurrentTime().then(seconds => {
      newPlayer.setCurrentTime(seconds)
      newPlayer.play()
    })
  }

  toggleOrientationCheck(enable) {
    if (enable) {
      window.addEventListener('orientationchange', this.validateOrientationCallback)
      window.addEventListener('resize', this.validateOrientationCallback)
    } else {
      window.removeEventListener('orientationchange', this.validateOrientationCallback)
      window.removeEventListener('resize', this.validateOrientationCallback)
    }
  }

  unload() {
    this.container.classList.remove('video--active')
    if (this.button) {
      this.button.classList.remove('video__button--loading')
    }
  }

}
