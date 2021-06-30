import $ from 'jquery'
import { generateId, make } from '../util'
import { translate } from '../../i18n'
import EditorTool from './_editor-tool'
import FileUploader from '../elements/file-uploader'

export default class TextTool extends EditorTool {
  static get toolbox() {
    return {
      icon: '<i class="list alternate icon"></i>',
      title: translate('blocks.textbox.label'),
    }
  }

  constructor({data, _config, api}) {
    super({ // Data
      id: data.id || generateId(),
      title: data.title || '',
      subtitle: data.subtitle || '',
      text: data.text || '',
      action: data.action || '',
      url: data.url || '',
      image: data.image || null,
      mediaFiles: data.mediaFiles || [],
      type: ['text', 'image', 'splash'].includes(data.type) ? data.type : 'text',
      alignment: ['left', 'center', 'right'].includes(data.alignment) ? data.alignment : 'left',
      style: ['quote', 'poem'].includes(data.style) ? data.style : 'quote',
      spacing: ['overlap', 'separate'].includes(data.spacing) ? data.spacing : 'overlap',
      background: ['white', 'image', 'brown'].includes(data.background) ? data.background : 'white',
      color: ['dark', 'light'].includes(data.color) ? data.color : 'light',
      position: ['left', 'right'].includes(data.position) ? data.position : 'left',
      decorations: data.decorations || {},
    }, { // Config
      id: 'textbox',
      fields: {
        image: { input: false },
        title: { input: 'title', contained: true },
        subtitle: { label: 'Subtitle', input: 'caption', contained: true },
        text: { input: 'content' },
        action: { input: 'button', contained: true },
        url: { input: 'url', contained: true },
      },
      tunes: {
        type: {
          options: [
            { name: 'text', icon: 'square', },
            { name: 'image', icon: 'images' },
            { name: 'splash', icon: 'ticket alternate' },
          ]
        },
        alignment: {
          requires: { type: ['text'] },
          options: [
            { name: 'left', icon: 'indent' },
            { name: 'center', icon: 'align center' },
            { name: 'right', icon: 'horizontally flipped indent' },
          ]
        },
        style: {
          requires: { type: ['text'] },
          options: [
            { name: 'quote', icon: 'font' },
            { name: 'poem', icon: 'quora' },
          ]
        },
        position: {
          requires: { type: ['image'] },
          options: [
            { name: 'left', icon: 'clone outline flipped' },
            { name: 'right', icon: 'clone outline' },
          ]
        },
        background: {
          requires: { type: ['image'] },
          options: [
            { name: 'white', icon: 'square outline' },
            { name: 'image', icon: 'image outline' },
            { name: 'brown', icon: 'university' },
          ]
        },
        spacing: {
          requires: { background: ['white'] },
          options: [
            { name: 'overlap', icon: 'clone outline' },
            { name: 'separate', icon: 'columns' },
          ]
        },
        color: {
          requires: [
            { type: ['image'], background: ['image'] },
            { type: ['splash'] },
          ],
          options: [
            { name: 'dark', icon: 'list alternate outline' },
            { name: 'light', icon: 'list alternate' },
          ]
        },
      },
      decorations: {
        sidetext: { requires: { type: ['image'] } },
        triangle: { requires: { type: ['image'] } },
        gradient: { requires: { type: ['image'] } },
        circle: { requires: { type: ['image'] } },
      },
    }, api)

    this.CSS.fieldsContainer = `${this.CSS.container}__fields`
    this.CSS.image = {
      remove: `cdx-${this.id}__remove-image`,
      img: `cdx-${this.id}__image`,
    }
  }

  render() {
    const container = super.render()

    const fieldsContainer = make('div', this.CSS.fieldsContainer, { innerHTML: container.innerHTML })
    container.innerHTML = null
    container.append(fieldsContainer)

    this.imageContainer = make('div', [this.CSS.input], { data: { key: 'image' } }, container)

    this.uploader = new FileUploader(this.imageContainer)
    this.uploader.addEventListener('uploadstart', event => this.setImage(event.detail.file))
    this.uploader.addEventListener('uploadend', event => {
      this.imageContainer.dataset.attributes = JSON.stringify(event.detail.response)
    })

    this.imageRemoveIcon = make('i', [this.CSS.image.remove, 'ui', 'times', 'circle', 'fitted', 'link', 'icon'], {}, this.imageContainer)
    this.imageRemoveIcon.addEventListener('click', () => this.setImage(null))

    if (this.data.image && this.data.image.preview) {
      make('img', this.CSS.image.img, { src: this.data.image.preview }, this.imageContainer)
      this.imageContainer.dataset.attributes = JSON.stringify(this.data.image)
      $(this.uploader.wrapper).hide()
    } else {
      $(this.imageRemoveIcon).hide()
    }

    fieldsContainer.querySelector(`.${this.CSS.input}[data-key="text"]`).addEventListener('keydown', event => this.insertParagraphBreak(event))
    return container
  }

  save(toolElement) {
    const data = super.save(toolElement)

    if (this.imageContainer.dataset.attributes) {
      const imageData = JSON.parse(this.imageContainer.dataset.attributes)
      data.mediaFiles = [imageData.id]
      data.image = imageData
    } else {
      delete data.image
    }

    this.data = data
    return data
  }

  setImage(file) {
    if (file) {
      const placeholder = make('div', [this.CSS.image.img, 'ui', 'fluid', 'placeholder'], {})
      this.imageContainer.appendChild(placeholder)
      $(this.uploader.wrapper).hide()
      $(this.imageRemoveIcon).show()

      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = () => {
        const img = make('img', this.CSS.image.img, { src: reader.result })
        placeholder.replaceWith(img)
      }
    } else {
      this.imageContainer.querySelector(`.${this.CSS.image.img}`).remove()
      $(this.uploader.wrapper).show()
      $(this.imageRemoveIcon).hide()
    }
  }

  pasteHandler(event) {
    const element = event.detail.data
    let data = {
      type: 'text',
      text: element.innerText
    }

    this.data = data
    this.container.querySelector(`.${this.CSS.input}[data-key="action"]`).innerHTML = data.text
  }

  // Define the types of paste that should be handled by this tool.
  static get pasteConfig() {
    return { tags: ['BLOCKQUOTE'] }
  }

  // Sanitizer data before saving
  static get sanitize() {
    return {
      title: false,
      subtitle: false,
      text: {
        br: true,
        a: { href: true },
        b: true,
        i: true,
      },
      action: false,
      url: false,
      image: false,
    }
  }

  static get enableLineBreaks() {
    return true
  }

  static get contentless() {
    return false
  }
}
