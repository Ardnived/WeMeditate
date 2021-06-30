import Amplitude from 'amplitudejs'
import zenscroll from 'zenscroll'
import { sendAnalyticsEvent } from '../util'

// TODO: Implement responsive artist images

export default class MusicPlayer {

  constructor(element) {
    this.container = element
    this.activePlaylistId = null
    this.mini = element.classList.contains('amplitude--mini')
    this.sidetext = element.querySelector('.amplitude-sidetext')
    this.artistsList = element.querySelector('.amplitude-info-artists')
    this.playButton = element.querySelector('.amplitude-play-pause')
    this.active = false
    const data = JSON.parse(element.dataset.tracks)
    this.playlists = data.playlists

    Amplitude.init({
      volume: 80,
      songs: data.songs,
      playlists: data.playlists,
      starting_playlist: 0,
      preload: this.mini ? 'none' : 'metadata',
      callbacks: {
        loadstart: () => {
          if (this.active) this.playButton.classList.add('amplitude-loading')
        },
        canplaythrough: () => {
          this.playButton.classList.remove('amplitude-loading')
        },
        song_change: () => {
          this.active = true
          this.updateSongArtists()
          this.sendAnalyticsEvent('Change')
          if ('mediaSession' in navigator) {
            navigator.mediaSession.setPositionState(null)
            this.updatePositionState()
          }
        },
        play: () => {
          this.active = true
          this.validateActivePlaylist()
          this.sendAnalyticsEvent('Play')
          this.setupMediaSession()
          this.playButton.classList.remove('amplitude-paused')
          this.playButton.classList.add('amplitude-playing')
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing'
            this.updatePositionState()
          }
        },
        pause: () => {
          this.sendAnalyticsEvent('Pause')
          this.playButton.classList.remove('amplitude-playing')
          this.playButton.classList.add('amplitude-paused')
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused'
            this.updatePositionState()
          }
        },
        seeked: () => {
          if ('mediaSession' in navigator) {
            this.updatePositionState()
          }
        }
      }
    })

    this.container.querySelectorAll('.amplitude-song-container').forEach(element => {
      element.addEventListener('click', () => {
        this.sendAnalyticsEvent('Selected')
      })
    })
    
    if (!this.mini) this.initFullPlayer()
    this.updateSongArtists()
  }

  unload() {
    Amplitude.pause()
  }

  initFullPlayer() {
    const playlistButtons = this.container.querySelectorAll('.amplitude-playlist-button')
    for (let i = 0; i < playlistButtons.length; i++) {
      playlistButtons[i].addEventListener('click', event => this.togglePlaylist(event.currentTarget))
    }

    const artistLinks = this.container.querySelectorAll('.amplitude-song-artist > a')
    for (let i = 0; i < artistLinks.length; i++) {
      artistLinks[i].addEventListener('click', event => event.stopPropagation())
    }
  }

  togglePlaylist(playlistElement) {
    if (playlistElement.dataset.amplitudePlaylist == this.activePlaylistId) {
      this.container.classList.remove('amplitude-loading')
      Amplitude.playPlaylistSongAtIndex(0, '0')
      Amplitude.pause()
    }
  }

  updateSongArtists() {
    if (!this.artistsList) return
    const data = Amplitude.getActiveSongMetadata()

    let html = []	
    data.artists.forEach(artist => {	
      html.push(`<a href="${artist.url}" target="_blank">${artist.name}</a>`)
    })
    
    this.artistsList.innerHTML = html.join(', ')
  }

  validateActivePlaylist() {
    if (this.mini) return
    const playlistId = Amplitude.getActivePlaylist()
    if (this.activePlaylistId == playlistId) return

    if (this.activePlaylistId == null) this.activePlaylistId = '0'
    this.setElementActive(this.activePlaylistId, 'playlist-button', false)
    this.setElementActive(this.activePlaylistId, 'playlist-container', false)

    this.activePlaylistId = playlistId
    this.setElementActive(playlistId, 'playlist-button', true)
    this.setElementActive(playlistId, 'playlist-container', true)

    if (this.sidetext) {
      this.sidetext.innerText = this.playlists[playlistId].title
    }
  }

  setElementActive(playlistId, elementClass, active) {
    const selector = `.amplitude-${elementClass}[data-amplitude-playlist="${playlistId}"]`
    const element = this.container.querySelector(selector)
    if (element) {
      element.classList.toggle(`amplitude-active-${elementClass}`, active)

      if (active && elementClass == 'playlist-container') {
        zenscroll.intoView(element)
      }
    }
  }

  sendAnalyticsEvent(type) {
    const data = Amplitude.getActiveSongMetadata()
    sendAnalyticsEvent(`Music ${type}`, { globalTitle: `Song ${data.id}`, localTitle: data.name })
  }

  seek(seconds, direction) {
    const duration = Amplitude.getSongDuration()
    const currentTime = Amplitude.getSongPlayedSeconds()
    let targetTime = direction == 'backward' ? currentTime - seconds : currentTime + seconds
    targetTime = targetTime <= 0 ? 0.1 : targetTime >= duration ? duration - 0.1 : targetTime
    Amplitude.setSongPlayedPercentage((targetTime / duration) * 100)
  }

  updatePositionState() {
    if ('setPositionState' in navigator.mediaSession) {
      navigator.mediaSession.setPositionState({
        duration: Amplitude.getSongDuration(),
        playbackRate: Amplitude.getPlaybackSpeed(),
        position: Amplitude.getSongPlayedSeconds()
      })
    }
  }

  setupMediaSession() {
    const data = Amplitude.getActiveSongMetadata()
    let skipSeconds = 10

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: data.name,
        artist: this.artistsList.innerText,
        artwork: data.image.versions.map(version => {
          return { src: version.url, sizes: `${version.width}x${version.width}`, type: `image/${version.type}` }
        })
      })

      const actionHandlers = {
        previoustrack: () => {
          Amplitude.prev()
        },
        nexttrack: () => {
          Amplitude.next()
          Amplitude.play()
        },
        seekbackward: () => {
          this.seek(skipSeconds, 'backward')
          this.updatePositionState()
        },
        seekforward: () => {
          this.seek(skipSeconds, 'forward')
          this.updatePositionState()
        },
        seekto: (event) => {
          const duration = Amplitude.getSongDuration()
          let targetTime = event.seekTime
          targetTime = targetTime <= 0 ? 0.1 : targetTime >= duration ? duration - 0.1 : targetTime
          Amplitude.setSongPlayedPercentage((targetTime / duration) * 100)
          this.updatePositionState()
        }
      }

      for ( let [action, handler] of Object.entries(actionHandlers) ) {
        navigator.mediaSession.setActionHandler(action, handler)
      }

    }
  }

}
