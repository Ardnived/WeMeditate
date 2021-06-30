import PhotoSwipe from 'photoswipe'
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default'

// TODO: Implement responsive images - https://photoswipe.com/documentation/responsive-images.html
// TODO: Performance tips - https://photoswipe.com/documentation/performance-tips.html

export default class ImageGallery {

  constructor(element) {
    this.id = element.dataset.id
    this.photoswipeHtml = document.getElementById('pswp')
    this.slides = []

    this.images = element.querySelectorAll('figure')
    for (var i = 0, l = this.images.length; i < l; i++) {
      const image = this.images[i]
      image.dataset.index = i
      this.slides.push(JSON.parse(image.dataset.attributes))
      image.addEventListener('click', event => {
        this.selectImage(parseInt(image.dataset.index))
        event.preventDefault()
      })
    }

    const params = new URLSearchParams(window.location.search)
    if (params.has('gid') && params.has('pid') && params.get('gid') == this.id) {
      this.selectImage(parseInt(params.get('pid')))
    }
  }

  selectImage(index) {
    this.gallery = new PhotoSwipe(this.photoswipeHtml, PhotoSwipeUI_Default, this.slides, {
      galleryUID: this.id,
      galleryPIDs: true,
      index: index,
      history: false,
      getThumbBoundsFn: index => { return this.getThumbanailRect(index) },
    })

    this.gallery.init()
  }

  getThumbanailRect(index) {
    const thumbnail = this.images[index]
    const pageYScroll = window.pageYOffset || document.documentElement.scrollTop 
    const rect = thumbnail.getBoundingClientRect()
    return { x: rect.left, y: rect.top + pageYScroll, w: rect.width }
  }

}
