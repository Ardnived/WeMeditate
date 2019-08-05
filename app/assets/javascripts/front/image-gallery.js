
class ImageGallery {

  constructor(element) {
    $(element).magnificPopup({
      delegate: 'img',
      type: 'image',
      mainClass: 'mfp-img-mobile',
      gallery: {
        enabled: true,
        navigateByImgClick: true,
        preload: [0, 1], // Will preload 0 - before current, and 1 after the current image
      },
      image: {
        titleSrc: 'title',
      },
      callbacks: {
        elementParse: item => this.getImageSrc(item),
      },
    })
  }

  getImageSrc(item) {
    console.log(item)
    const images = item.el[0].srcset.split(', ')
    console.log(images)
    for (let i = images.length - 1; i >= 0; i--) {
      const image = images[i].split(' ')
      const size = parseInt(image[1].slice(0, -1))

      console.log('test', image, size, '>?', window.innerWidth)
      if (size > window.innerWidth) {
        item.src = image[0]
        return
      }
    }
  }

}
