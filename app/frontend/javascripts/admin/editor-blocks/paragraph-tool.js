import { generateId } from '../util'
import { translate } from '../../i18n'
import EditorTool from './_editor-tool'

export default class ParagraphTool extends EditorTool {
  static get toolbox() {
    return {
      icon: '<i class="font icon"></i>',
      title: translate('blocks.paragraph.label'),
    }
  }

  constructor({data, _config, api}) {
    super({ // Data
      id: data.id || generateId(),
      text: data.text || '',
      type: ['text', 'header'].includes(data.type) ? data.type : 'text',
      level: ['h2', 'h3', 'h4', 'h5'].includes(data.type) ? data.type : 'h2',
      decorations: data.decorations || {},
    }, { // Config
      id: 'paragraph',
      fields: {
        text: { label: '', contained: false },
      },
      tunes: {
        type: {
          options: [
            { name: 'paragraph', icon: 'font' },
            { name: 'header', icon: 'heading' },
          ]
        },
        level: {
          requires: { type: ['header'] },
          options: [
            { name: 'h2', icon: 'heading' },
            { name: 'h3', icon: 'heading' },
            { name: 'h4', icon: 'heading' },
            { name: 'h5', icon: 'heading' },
          ]
        },
      },
      decorations: {
        //leaves: { requires: { type: ['header'] }},
      },
    }, api)

    this.onKeyUp = this.onKeyUp.bind(this)
  }

  // Check if text content is empty and set empty string to inner html.
  // We need this because some browsers (e.g. Safari) insert <br> into empty contenteditable elements
  onKeyUp(event) {
    if (event.code !== 'Backspace' && event.code !== 'Delete') {
      return
    }

    if (this.container.textContent === '') {
      this.container.innerHTML = ''
    }
  }

  // How to merge with another text element.
  merge(data) {
    this.data = { text: this.data.text + data.text }
  }

  // Check for emptiness
  validate(blockData) {
    return blockData.text.trim() !== ''
  }

  pasteHandler(event) {
    const element = event.detail.data
    const { tagName: tag } = element
    let data = {
      text: element.innerHTML,
      type: tag == 'P' ? 'text' : 'header'
    }

    if (tag != 'P') {
      data.level = tag.toLowerCase()
      if (data.level == 'h1') data.level = 'h2'
      if (data.level == 'h6') data.level = 'h5'
    }

    this.data = data
    this.container.querySelector(`.${this.CSS.input}[data-key="text"]`).innerHTML = this.data.text
  }

  // Define the types of paste that should be handled by this tool.
  static get pasteConfig() {
    return { tags: ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'] }
  }

  // Sanitizer data before saving
  static get sanitize() {
    return {
      text: {},
    }
  }
}
