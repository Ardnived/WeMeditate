import $ from 'jquery'
import { initLazyImages, initInlineSVGs } from './public/images.js'

let preloaded = false
let preloader

$.ready(() => {
  console.log('ready')
  initLazyImages()
  initInlineSVGs()

  preloader = document.querySelector('.preloader')
  if (preloader) {
    if (preloaded) {
      preloader.remove()
    } else {
      document.body.classList.add('noscroll')
    }
  }
})

window.addEventListener('load', () => {
  console.log('load')
  $(preloader).delay(1000).fadeOut('slow')
  document.body.classList.remove('noscroll')
  preloaded = true
})