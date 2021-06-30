import { make } from '../util'
import { translate } from '../../i18n'
import { uploadFile } from '../features/uploader'

export default class FileUploader {

  constructor(container = null) {
    this.fileCounter = 0

    this.wrapper = make('div', 'uploader', {
      innerHTML: translate('uploader.drag', { file: translate('uploader.file.many').toLowerCase() })
    }, container)

    this.input = make('input', '', {
      type: 'file',
      accept: 'image/png, image/jpg, image/jpeg'
    }, this.wrapper)

    this.wrapper.addEventListener('dragover', event => {
      event.preventDefault()
    })

    this.wrapper.addEventListener('dragenter', event => {
      event.target.classList.add('uploader--dropping')
      event.target.classList.remove('uploader--error')
      event.preventDefault()
    })

    this.wrapper.addEventListener('dragleave', event => {
      event.target.classList.remove('uploader--dropping')
    })

    this.wrapper.addEventListener('click', () => this.input.click())
    this.wrapper.addEventListener('drop', event => this._onImageDrop(event))
    this.input.addEventListener('change', event => this._onImageSelect(event))
  }

  _onImageSelect(event) {
    for (let i = 0; i < event.target.files.length; i++) {
      const added = this.uploadFile(event.target.files[i])
      if (added && !this.allowMultiple) break
    }
  }

  _onImageDrop(event) {
    if (event.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        if (event.dataTransfer.items[i].kind === 'file') { // If dropped items aren't files, ignore them
          const added = this.uploadFile(event.dataTransfer.items[i].getAsFile())
          if (added && !this.allowMultiple) break
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        const added = this.uploadFile(event.dataTransfer.files[i])
        if (added && !this.allowMultiple) break
      }
    }

    event.preventDefault() // Prevent file from being opened
  }

  isAcceptedFileType(file) {
    return this.input.accept.includes(file.type)
  }

  uploadFile(file) {
    if (!this.isAcceptedFileType(file)) return false

    const index = this.fileCounter
    this.fileCounter++

    const event = new CustomEvent('uploadstart', { detail: { index: index, file: file } })
    this.wrapper.dispatchEvent(event)

    uploadFile(file, (result) => {
      const event = new CustomEvent('uploadend', { detail: { index: index, response: result } })
      this.wrapper.dispatchEvent(event)
    }, (result) => {
      const event = new CustomEvent('uploadfailed', { detail: { index: index, response: result } })
      this.wrapper.dispatchEvent(event)
    })

    return true
  }

  setAllowMultiple(allow) {
    this.allowMultiple = allow

    if (allow) {
      this.input.setAttribute('multiple', true)
      this.wrapper.innerHTML = translate('uploader.drag', { file: translate('uploader.file.many').toLowerCase() })
    } else {
      this.input.removeAttribute('multiple')
      this.wrapper.innerHTML = translate('uploader.drag', { file: translate('uploader.file.one').toLowerCase() })
    }
  }

  addEventListener(type, callback) {
    this.wrapper.addEventListener(type, callback)
  }
}
