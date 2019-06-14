
class TextboxTool extends EditorTool {
  static get toolbox() {
    return {
      icon: '<i class="list alternate outline icon"></i>',
      title: 'Textbox',
    }
  }

  // Sanitizer data before saving
  static get sanitize() {
    return {
      title: false,
      text: {},
      action: false,
      link: false,
    }
  }

  constructor({data, _config, api}) {
    super({ // Data
      image: data.image || null,
      title: data.title || '',
      text: data.text || '',
      action: data.action || '',
      url: data.url || '',
      alignment: ['left', 'center', 'right'].includes(data.alignment) ? data.alignment : 'left',
      asWisdom: data.asWisdom || false,
      asVideo: data.asVideo || false,
      invert: data.invert || false,
      decorations: data.decorations || {},
    }, { // Config
      id: 'textbox',
      decorations: ['triangle', 'gradient', 'sidetext', 'circle'],
      fields: {
        image: { label: 'Image', input: false },
        title: { label: 'Title', input: 'title' },
        text: { label: 'Text', input: 'content' },
        action: { label: 'Action', input: 'button' },
        url: { label: 'Link', input: 'url' },
      },
      tunes: [
        {
          name: 'asWisdom',
          label: 'Ancient Wisdom Style',
          icon: 'university',
        },
        {
          name: 'asVideo',
          label: 'Video',
          icon: 'play',
        },
        {
          name: 'invert',
          label: 'Invert Colours',
          icon: 'adjust',
        },
        {
          name: 'left',
          label: 'Left Aligned',
          icon: 'align left',
          group: 'alignment',
        },
        {
          name: 'center',
          label: 'Center Aligned',
          icon: 'align center',
          group: 'alignment',
        },
        {
          name: 'right',
          label: 'Right Aligned',
          icon: 'align right',
          group: 'alignment',
        },
      ],
    }, api)

    this.CSS.fieldsContainer = `${this.CSS.container}-fields`
    this.CSS.image = {
      remove: `${this.CSS.fields.image}__remove`,
      img: `${this.CSS.fields.image}__img`,
    }
  }

  render() {
    const container = super.render()

    const fieldsContainer = make('div', this.CSS.fieldsContainer, { innerHTML: container.innerHTML })
    container.innerHTML = null
    container.append(fieldsContainer)
    this.renderDecorations(container)

    this.imageContainer = make('div', [this.CSS.input, this.CSS.fields.image], {}, container)

    this.imageUploader = new ImageUploader(this.imageContainer)
    this.imageUploader.addEventListener('uploadstart', event => this.setImage(event.detail.file))
    this.imageUploader.addEventListener('uploadend', event => this._onImageUploaded(event.detail.response))

    this.imageRemoveIcon = make('i', [this.CSS.image.remove, 'ui', 'times', 'circle', 'fitted', 'link', 'icon'], {}, this.imageContainer)
    this.imageRemoveIcon.addEventListener('click', () => this.setImage(null))

    if (this.data.image && this.data.image.preview) {
      make('img', this.CSS.image.img, { src: this.data.image.preview }, this.imageContainer)
      this.imageContainer.dataset.attributes = JSON.stringify(this.data.image)
      $(this.imageUploader.wrapper).hide()
    } else {
      $(this.imageRemoveIcon).hide()
    }

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
      const placeholder = make('div', [this.CSS.image.img, 'ui', 'fluid', 'placeholder'], {})
      this.imageContainer.appendChild(placeholder)
      $(this.imageUploader.wrapper).hide()
      $(this.imageRemoveIcon).show()

      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = () => {
        const img = make('img', this.CSS.image.img, { src: reader.result })
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

  // Empty Video is not empty Block
  static get contentless() {
    return false;
  }
}
