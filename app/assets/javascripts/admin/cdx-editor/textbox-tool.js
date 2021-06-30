/* global $, EditorTool, Util, ImageUploader, translate */
/* exported TextboxTool */

class TextboxTool extends EditorTool {
  static get toolbox() {
    return {
      icon: '<i class="list alternate outline icon"></i>',
      title: translate.content.blocks.textbox,
    }
  }

  // Sanitizer data before saving
  static get sanitize() {
    return {
      title: false,
      text: {
        br: true,
        a: { href: true },
        b: true,
        i: true,
      },
      action: false,
      link: false,
    }
  }

  constructor({data, _config, api}) {
    super({ // Data
      id: data.id || Util.generateId(),
      image: data.image || null,
      title: data.title || '',
      text: data.text || '',
      action: data.action || '',
      url: data.url || '',
      alignment: ['left', 'center', 'right'].includes(data.alignment) ? data.alignment : 'left',
      asWisdom: data.asWisdom || false,
      asVideo: data.asVideo || false,
      invert: data.invert || false,
      separate: data.separate || false,
      compact: data.compact || false,
      decorations: data.decorations || {},
    }, { // Config
      id: 'textbox',
      decorations: ['sidetext', 'triangle', 'gradient', 'circle'],
      fields: {
        image: { input: false },
        title: { input: 'title', contained: true },
        subtitle: { input: 'caption', contained: true },
        text: { input: 'content' },
        action: { input: 'button', contained: true },
        url: { input: 'url', contained: true },
      },
      tunes: [
        {
          name: 'asWisdom',
          icon: 'university',
        },
        {
          name: 'asVideo',
          icon: 'play',
        },
        {
          name: 'invert',
          icon: 'adjust',
        },
        {
          name: 'separate',
          icon: 'arrows alternate horizontal',
        },
        {
          name: 'compact',
          icon: 'clockwise rotated microchip',
        },
        {
          name: 'left',
          icon: 'align left',
          group: 'alignment',
        },
        {
          name: 'center',
          icon: 'align center',
          group: 'alignment',
        },
        {
          name: 'right',
          icon: 'align right',
          group: 'alignment',
        },
      ],
    }, api)

    this.CSS.fieldsContainer = `${this.CSS.container}__fields`
    this.CSS.image = {
      remove: `${this.CSS.fields.image}__remove`,
      img: `${this.CSS.fields.image}__img`,
    }
  }

  render() {
    const container = super.render()

    const fieldsContainer = Util.make('div', this.CSS.fieldsContainer, { innerHTML: container.innerHTML })
    container.innerHTML = null
    container.append(fieldsContainer)
    this.renderDecorations(container)

    this.imageContainer = Util.make('div', [this.CSS.input, this.CSS.fields.image], {}, container)

    this.imageUploader = new ImageUploader(this.imageContainer)
    this.imageUploader.addEventListener('uploadstart', event => this.setImage(event.detail.file))
    this.imageUploader.addEventListener('uploadend', event => this._onImageUploaded(event.detail.response))

    this.imageRemoveIcon = Util.make('i', [this.CSS.image.remove, 'ui', 'times', 'circle', 'fitted', 'link', 'icon'], {}, this.imageContainer)
    this.imageRemoveIcon.addEventListener('click', () => this.setImage(null))

    if (this.data.image && this.data.image.preview) {
      Util.make('img', this.CSS.image.img, { src: this.data.image.preview }, this.imageContainer)
      this.imageContainer.dataset.attributes = JSON.stringify(this.data.image)
      $(this.imageUploader.wrapper).hide()
    } else {
      $(this.imageRemoveIcon).hide()
    }

    fieldsContainer.querySelector(`.${this.CSS.fields.text}`).addEventListener('keydown', event => this.insertParagraphBreak(event))

    return container
  }

  save(toolElement) {
    const data = super.save(toolElement)
    if (this.imageContainer.dataset.attributes) {
      const imageData = JSON.parse(this.imageContainer.dataset.attributes)
      data.media_files = [imageData.id]
      data.image = imageData
    }

    return data
  }

  setImage(file) {
    if (file) {
      const placeholder = Util.make('div', [this.CSS.image.img, 'ui', 'fluid', 'placeholder'], {})
      this.imageContainer.appendChild(placeholder)
      $(this.imageUploader.wrapper).hide()
      $(this.imageRemoveIcon).show()

      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = () => {
        const img = Util.make('img', this.CSS.image.img, { src: reader.result })
        placeholder.replaceWith(img)
      }
    } else {
      this.imageContainer.querySelector(`.${this.CSS.image.img}`).remove()
      $(this.imageUploader.wrapper).show()
      $(this.imageRemoveIcon).hide()
    }
  }

  _onImageUploaded(data) {
    this.imageContainer.dataset.attributes = JSON.stringify(data)
  }

  selectTune(tune) {
    let active = super.selectTune(tune)

    if (active && tune.name == 'asWisdom') {
      if (this.data.alignment == 'center') this.setTuneValue('alignment', 'left')
      this.setTuneBoolean('invert', false)
      this.setTuneBoolean('asVideo', false)
    } else if (active && tune.name == 'asVideo') {
      if (this.data.alignment == 'center') this.setTuneValue('alignment', 'right')
      this.setTuneBoolean('invert', false)
      this.setTuneBoolean('asWisdom', false)
    } else if (active && (tune.name == 'center' || tune.name == 'invert')) {
      this.setTuneBoolean('asWisdom', false)
      this.setTuneBoolean('asVideo', false)
    }
  }

  static get enableLineBreaks() {
    return true
  }

  static get contentless() {
    return false
  }
}
