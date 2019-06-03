/** MUSIC PLAYER
 * This file controls all the interactive elements of the music player.
 * Much of the audio playback is managed by the plyr.js library, but the playlist related features are handled here.
 */

const Music = {
  // These variables will be set on load
  player: null,
  player_title: null,
  player_artist: null,
  mood_title: null,

  list: null,
  track_selectors: null,

  cover: null,
  default_cover_url: null,
  filter_icons: null,

  instrument_filters: null,
  mood_filters: null,

  // Called when turbolinks loads the page
  load() {
    console.log('loading Music.js')
    let $player = $('.player')
    var $audio = $('audio#track-player')
    var controls = $audio.children('data-controls').text();
    Music.player = new Plyr($audio, { controls, invertTime: true })

    Music.player_title = $player.find('.player-selection-title')
    Music.player_artist = $player.find('.player-selection-artist')
    Music.mood_title = $player.find('.playlist-sidetext')

    Music.list = $player.find('.playlist-list')
    Music.track_selectors = Music.list.find('.playlist-label')
    Music.track_selectors.each(Music._init_track)
    Music.track_selectors.on('click', Music._on_select_track)

    Music.cover = $player.find('.playlist-cover')
    Music.default_cover_url = Music.cover.attr('href')

    Music.filter_icons = $player.find('.playlist-icons')

    $('.filter-group[data-group="instruments"]').on('click', '.filter-item', Music._on_clicked_instrument_filter)
    $('.filter-group[data-group="moods"]').on('click', '.filter-button', Music._on_clicked_mood_filter)

    // Override plyr's default behaviour so that it will skip tracks
    $player.on('click', '[data-plyr="skip-back"]', Music._on_select_prev)
    $player.on('click', '[data-plyr="skip-forward"]', Music._on_select_next)
    Music.player.on('ended', Music._on_select_next)
  },

  // Called to load meta data for a track in the playlist.
  _init_track() {
    var label = $(this)
    var audio = new Audio()

    $(audio).on('loadedmetadata', function() {
      label.siblings('.playlist-duration').text(Music.format_duration(audio.duration))
    })

    audio.src = this.href
  },

  // Triggered when an instrument filter is selected
  // The actual playlist filtering is handled by the `grid.js` file,
  // this callback just adds some visual icons to signal what has been selected.
  _on_clicked_instrument_filter(event) {
    let $element = $(event.currentTarget)
    let klass = 'for-'+this.dataset.filter.slice(1)

    if ($element.hasClass('active')) {
      let icon = $($element.children('.filter-item-icon').html()).addClass(klass)
      let text = $element.children('.filter-item-name').text()

      //Music.filter_icons.append(icon) // Use this to allow multiple icons to be selected.
      Music.filter_icons.html(icon)
      Music.mood_title.text(text)

      if (!Music.player.playing) {
        first_track = Grid.containers['grid-tracks'].isotope('getFilteredItemElements')[0]
        Music._on_select_track.call(first_track.getElementsByClassName('playlist-label')[0])
      }

      let offset = Music.player_title.offset().top - 60
      Menu.scroll.animateScroll(offset, 4000, {
        speed: 4000,
        updateURL: false,
      })
    } else {
      Music.filter_icons.children('.'+klass).remove()
      Music.mood_title.text('')
    }
  },

  // Triggered when an mood filter is selected
  // The actual playlist filtering is handled by the `grid.js` file,
  // this callback just adds some text to signal what has been selected.
  _on_clicked_mood_filter(event) {
    let text = $(event.target).children('.filter-button-name').text()

    if (Music.mood_title.text() == text) {
      Music.mood_title.text('')
    } else {
      Music.mood_title.text(text)
    }
  },

  // Triggered when a track in the playlist is selected
  // This updates the player to show the new track and begin the audio playback.
  _on_select_track(event) {
    var image_url = this.dataset.artistImage
    Music.player_title.text(this.textContent)
    Music.player_artist.text(this.dataset.artistName)
    Music.player_artist.attr('href', this.dataset.artistUrl)

    if (!image_url) {
      image_url = Music.default_cover_url
    }

    Music.cover.attr('src', image_url)
    Music.player.source = {
      type: 'audio',
      title: this.textContent,
      sources: [
        { src: this.href, type: 'audio/mp3' },
      ]
    }

    Music.player.play()

    Music.list.find('.playlist-item').removeClass('active')
    $(this).closest('.playlist-item').addClass('active')
    if (event != null) event.preventDefault()
  },

  // Triggered when the "next" button is pressed.
  _on_select_next() {
    // Find the next track
    $next_track = Music.list.children('.active.playlist-item').next('.playlist-item')

    while ($next_track.css('display') == 'none') {
      $next_track = $next_track.next()

      if ($next_track.length == 0) {
        // If there is no next track, then cycle to the beginning of the playlist.
        $next_track = Music.list.children('.playlist-item:first-of-type')
      }
    }

    next_track_selector = $next_track.children('.playlist-label')[0]

    // Select the next track
    Music._on_select_track.call(next_track_selector)
  },

  // Triggered when the "next" button is pressed.
  _on_select_prev() {
    // Find the previous track
    $prev_track = Music.list.children('.active.playlist-item').prevAll('.playlist-item:visible').first()

    if ($prev_track.length == 0) {
      // If there is not previous track, then cycle to the end of the playlist.
      $prev_track = Music.list.children('.playlist-item:visible').last()
    }

    prev_track_selector = $prev_track.children('.playlist-label')[0]

    // Select the previous track, which we've now found.
    Music._on_select_track.call(prev_track_selector)
  },

  // Formats a duration in seconds into a string suitable for display.
  format_duration(seconds) {
    var sec_num = parseInt(seconds, 10) // don't forget the second param
    var hours   = Math.floor(sec_num / 3600)
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60)
    var seconds = sec_num - (hours * 3600) - (minutes * 60)

    if (seconds < 10) { seconds = "0"+seconds }

    if (hours > 0) {
      if (hours   < 10) { hours   = "0"+hours }
      if (minutes < 10) { minutes = "0"+minutes }

      return hours+':'+minutes+':'+seconds
    } else {
      return minutes+':'+seconds
    }
  },
}

$(document).on('turbolinks:load', () => { Music.load() })
