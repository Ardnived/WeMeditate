/** Front Application
 * This file orchestrates and loads all the other files in this folder.
 */

import zenscroll from 'zenscroll'
import Accordion from './elements/accordion'
import Carousel from './elements/carousel'

let instances = {}
window.instances = instances // For debugging purposes

function loadAll(selector, Klass) {
  console.log('loading', selector) // eslint-disable-line no-console
  const result = []
  document.querySelectorAll(`.js-${selector}`).forEach(element => {
    console.log('Init', selector, 'on', element) // eslint-disable-line no-console
    result.push(new Klass(element, result.length))
  })

  instances[selector] = result
}

function loadFirst(id, Klass) {
  console.log('Init', id, 'on', document.getElementById(id)) // eslint-disable-line no-console
  var element = document.getElementById(id)

  if (element) {
    instances[id] = [new Klass(element)]
  }
}

export function init() {
  const scrollback = document.querySelector('.footer__scrollback')
  if (scrollback) {
    scrollback.addEventListener('click', event => {
      zenscroll.toY(0)
      event.preventDefault()
    })
  }

  if (instances.header && instances.header.count > 0) instances.header[0].init()
  if (instances.categories && instances.categories.count > 0) instances.categories[0].init()
}

export function load() {
  loadAll('accordion', Accordion)
  loadAll('carousel', Carousel)
  /*
  loadAll('dropdown', Dropdown)
  loadAll('form', Form)
  loadAll('grid', Grid)
  loadAll('loadmore', Loadmore)
  loadAll('video', Video)
  loadAll('gallery', ImageGallery)
  loadAll('reading-time', ReadingTime)
  loadAll('countdown', CountdownTimer)

  loadFirst('header', Header)
  loadFirst('subtle-system', SubtleSystem)
  loadFirst('music-player', MusicPlayer)
  loadFirst('custom-meditation', CustomMeditation)
  loadFirst('prescreen', Prescreen)
  loadFirst('geosearch', GeoSearch)
  loadFirst('language-switcher', LanguageSwitcher)
  loadFirst('categories', Categories)
  */
}

export function unload() {
  for (let selector in instances) {
    for (let key in instances[selector]) {
      let instance = instances[selector][key]
      if (typeof instance.unload === 'function') {
        console.log('unloading', selector) // eslint-disable-line no-console
        instance.unload()
      }
    }
  }

  instances = {}
}
