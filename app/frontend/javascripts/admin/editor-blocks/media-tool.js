import $ from 'jquery'
import { generateId, make, translate } from '../util'
import EditorTool from './_editor-tool'
import FileUploader from '../elements/file-uploader'

export default class MediaTool extends EditorTool {
  static get toolbox() {
    return {
      icon: '<i class="camera icon"></i>',
      title: 'Media',
    }
  }

  constructor({data, _config, api}) {
    super({ // Data
      id: data.id || generateId(),
      items: data.items || [],
      type: ['image', 'video', 'image'].includes(data.type) ? data.type : 'image',
      quantity: ['single', 'gallery'].includes(data.quantity) ? data.quantity : 'single',
      position: ['left', 'center', 'right'].includes(data.position) ? data.position : 'center',
      size: ['narrow', 'wide'].includes(data.size) ? data.size : 'normal',
    }, { // Config
      id: 'media',
      fields: {},
      tunes: {
        type: {
          options: [
            { name: 'image', icon: 'image', },
            { name: 'video', icon: 'film', },
            { name: 'audio', icon: 'volume up' },
          ]
        },
        quantity: {
          options: [
            { name: 'single', icon: 'square' },
            { name: 'gallery', icon: 'clone' },
          ]
        },
        position: {
          requires: { type: ['image', 'video'], quantity: ['single'] },
          options: [
            { name: 'left', icon: 'indent' },
            { name: 'center', icon: 'align center' },
            { name: 'right', icon: 'horizontally flipped indent' },
          ]
        },
        size: {
          requires: { type: ['image'], quantity: ['single'], position: ['center'] },
          options: [
            { name: 'normal', icon: 'minus' },
            { name: 'wide', icon: 'arrows alternate horizontal' },
          ]
        },
      },
    }, api)

    this.CSS.items = `${this.CSS.container}__items`
    this.CSS.item = {
      container: `${this.CSS.container}__item`,
      image: `${this.CSS.items}__image`,
      alt: `${this.CSS.items}__alt`,
      caption: `${this.CSS.items}__caption`,
      credit: `${this.CSS.items}__credit`,
      remove: `${this.CSS.items}__remove`,
    }
  }

  render() {
    this.container = super.render()

    this.uploader = new FileUploader(this.container)
    this.uploader.addEventListener('uploadstart', event => this.addFile(event.detail.index, event.detail.file))
    this.uploader.addEventListener('uploadend', event => this._onUpload(event.detail.index, event.detail.response))

    this.itemsContainer = make('div', this.CSS.items, {}, this.container)

    if (this.data.items.length) {
      if (!this.isGallery) $(this.uploader.wrapper).hide()

      this.data.items.forEach(item => {
        this.itemsContainer.appendChild(this.renderItem(item))
      })
    }

    this.uploader.setAllowMultiple(this.isGallery)
    return this.container
  }

  renderItem(item = {}) {
    const container = make('div', this.CSS.item.container, {})

    if (item.image && item.image.preview) {
      const img = make('div', [this.CSS.item.image, 'ui', 'rounded', 'image'], {}, container)
      make('img', null, { src: item.image.preview }, img)
      img.dataset.attributes = JSON.stringify(item.image)
    } else {
      make('div', [this.CSS.item.image, 'ui', 'fluid', 'placeholder'], {}, container)
    }

    let alt = make('div', [this.CSS.input, this.CSS.inputs.text, this.CSS.item.alt], {
      contentEditable: true,
      innerHTML: item.alt || '',
    }, container)

    alt.dataset.placeholder = translate().content.placeholders.alt
    alt.addEventListener('keydown', event => this.inhibitEnterAndBackspace(event))

    let caption = make('div', [this.CSS.input, this.CSS.inputs.alt, this.CSS.item.caption], {
      contentEditable: true,
      innerHTML: item.caption || '',
    }, container)

    caption.dataset.placeholder = translate().content.placeholders.caption
    caption.addEventListener('keydown', event => this.inhibitEnterAndBackspace(event))

    let credit = make('div', [this.CSS.input, this.CSS.inputs.caption, this.CSS.item.credit], {
      contentEditable: true,
      innerHTML: item.credit || '',
    }, container)

    credit.dataset.placeholder = translate().content.placeholders.credit
    credit.addEventListener('keydown', event => this.inhibitEnterAndBackspace(event))

    let remove = make('i', [this.CSS.item.remove, 'ui', 'times', 'circle', 'fitted', 'link', 'icon'], {}, container)
    remove.addEventListener('click', (event) => this.removeItem(event.target.parentNode))

    return container
  }

  _onUpload(index, data) {
    this.itemsContainer.querySelector(`[data-index="${index}"]`).dataset.attributes = JSON.stringify(data)
  }

  removeItem(item) {
    if (this.isGallery) {
      item.remove()
    } else {
      // If we are in single mode, then remove all images, to tidy up and stray images from the gallery mode.
      this.itemsContainer.innerHTML = ''
    }

    // Show the uploader if there are no images currently shown.
    if (this.itemsContainer.childElementCount === 0) {
      $(this.uploader.wrapper).show()
    }
  }

  addFile(index, file) {
    const item = this.renderItem()
    this.itemsContainer.appendChild(item)

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      const image = make('div', [this.CSS.item.image, 'ui', 'rounded', 'image'])
      make('img', null, { src: reader.result }, image)
      image.dataset.index = index
      item.querySelector(`.${this.CSS.item.image}`).replaceWith(image)
    }

    // Hide the uploader if we are using the single uploader and there is already an uploaded image.
    if (!this.isGallery && this.itemsContainer.childElementCount > 0) {
      $(this.uploader.wrapper).hide()
    }
  }

  save(_toolElement) {
    let newData = {}
    newData.mediaFiles = []
    newData.items = []

    for (let i = 0; i < this.itemsContainer.childElementCount; i++) {
      const item = this.itemsContainer.children[i]
      const image = JSON.parse(item.querySelector(`.${this.CSS.item.image}`).dataset.attributes)
      const itemData = {
        image: image,
        alt: item.querySelector(`.${this.CSS.item.alt}`).innerText,
        caption: item.querySelector(`.${this.CSS.item.caption}`).innerText,
        credit: item.querySelector(`.${this.CSS.item.credit}`).innerText,
      }

      if (!this.isGallery) {
        itemData.credit = item.querySelector(`.${this.CSS.item.credit}`).innerText
      }

      newData.mediaFiles.push(image.id)
      newData.items.push(itemData)

      //if (!this.isGallery) break // TODO: Only save one image, if we are in single mode.
    }

    this.removeInactiveTunes()
    console.log('saving', newData)
    return Object.assign(this.data, newData)
  }

  validate(blockData) {
    return blockData.items.length > 0
  }

  selectTune(tune) {
    super.selectTune(tune)

    if (tune.group == 'quantity') {
      this.uploader.setAllowMultiple(this.isGallery)
      $(this.uploader.wrapper).toggle(this.isGallery || this.itemsContainer.childElementCount === 0)
    }
  }

  get isGallery() {
    return this.data.quantity == 'gallery'
  }

  pasteHandler(event) {
    /*
    const element = event.detail.data
    let data = {
      type: 'single',
      text: element.innerText
    }

    this.data = data
    this.container.querySelector(`.${this.CSS.fields.text}`).innerHTML = data.text
    */
  }

  // Define the types of paste that should be handled by this tool.
  static get pasteConfig() {
    return { tags: ['IMG', 'FIGURE', 'FIGCAPTION'] }
  }

  static get sanitize() {
    return {}
  }

  static get enableLineBreaks() {
    return true
  }

  static get contentless() {
    return false
  }
}
