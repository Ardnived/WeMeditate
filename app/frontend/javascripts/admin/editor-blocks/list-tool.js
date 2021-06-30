import { generateId, make } from '../util'
import { translate } from '../../i18n'
import EditorTool from './_editor-tool'

export default class ListTool extends EditorTool {
  static get toolbox() {
    return {
      icon: '<i class="list icon"></i>',
      title: translate('blocks.list.label'),
    }
  }

  constructor({data, _config, api}) {
    super({ // Data
      id: data.id || generateId(),
      items: data.items || [],
      type: ['text', 'contents'].includes(data.type) ? data.type : 'text',
      style: ['unordered', 'ordered', 'leaf'].includes(data.style) ? data.style : 'unordered',
    }, { // Config
      id: 'list',
      fields: {
        items: { input: false }
      },
      tunes: {
        type: {
          options: [
            { name: 'text', icon: 'font', },
            { name: 'contents', icon: 'book' },
          ]
        },
        style: {
          requires: { type: ['text'] },
          options: [
            { name: 'unordered', icon: 'list ul' },
            { name: 'ordered', icon: 'list ol' },
            { name: 'leaf', icon: 'leaf' },
          ]
        },
      },
    }, api)

    this.CSS.item = `${this.CSS.container}__item`
  }

  save(toolElement) {
    const itemsData = []
    const items = toolElement.querySelectorAll(`.${this.CSS.item}`)

    for (let i = 0; i < items.length; i++) {
      const value = items[i].innerHTML.replace('<br>', ' ').trim()
      if (value) itemsData.push(items[i].innerHTML)
    }

    this.removeInactiveData()
    return Object.assign(this.data, { items: itemsData })
  }

  render() {
    this.container = make('div', [this.CSS.baseClass, this.CSS.container], {
      data: { contents: translate('blocks.list.type.contents') }
    })
    this.container.addEventListener('keydown', event => this._onItemKeydown(event))

    const list = make('ul', [this.CSS.input], { contentEditable: true, data: { key: 'items' } }, this.container)

    if (this.data.items.length) {
      this.data.items.forEach(item => {
        make('li', this.CSS.item, { innerHTML: item }, list)
      })
    } else {
      make('li', this.CSS.item, {}, list)
    }

    return this.container
  }

  _onItemKeydown(event) {
    const [ENTER, BACKSPACE] = [13, 8] // key codes

    switch (event.keyCode) {
    case ENTER:
      this.getOutofList(event)
      break
    case BACKSPACE:
      this.backspace(event)
      break
    }
  }

  /**
   * Returns current List item by the caret position
   */
  get currentItem() {
    let currentNode = window.getSelection().anchorNode

    if (currentNode.nodeType !== Node.ELEMENT_NODE) {
      currentNode = currentNode.parentNode
    }

    return currentNode.closest(`.${this.CSS.item}`)
  }

  /**
   * Get out from List Tool by Enter on the empty last item
   */
  getOutofList(event) {
    const items = this.container.querySelectorAll('.' + this.CSS.item)

    // Save the last one.
    if (items.length < 2) {
      return
    }

    const lastItem = items[items.length - 1]
    const currentItem = this.currentItem

    // Prevent Default li generation if item is empty
    if (currentItem === lastItem && !lastItem.textContent.trim().length) {
      // Insert New Block and set caret
      currentItem.parentElement.removeChild(currentItem)
      this.api.blocks.insert()
      this.api.caret.setToBlock(this.api.blocks.getCurrentBlockIndex())
      event.preventDefault()
      event.stopPropagation()
    }
  }

  /**
   * Handle backspace
   */
  backspace(event) {
    const items = this.container.querySelectorAll('.' + this.CSS.item)
    const firstItem = items[0]

    if (!firstItem) {
      return
    }

    // Save the last one.
    if (items.length < 2 && !firstItem.innerHTML.replace('<br>', ' ').trim()) {
      event.preventDefault()
    }
  }

  /**
   * Select LI content by CMD+A
   */
  selectItem(event) {
    event.preventDefault()

    const selection = window.getSelection()
    const currentNode = selection.anchorNode.parentNode
    const currentItem = currentNode.closest('.' + this.CSS.item)
    const range = new Range()

    range.selectNodeContents(currentItem)

    selection.removeAllRanges()
    selection.addRange(range)
  }

  /**
   * Handle UL, OL and LI tags paste and returns List data
   */
  pasteHandler(event) {
    const element = event.detail.data
    const { tagName: tag } = element
    let style

    switch (tag) {
    case 'OL':
      style = 'ordered'
      break
    case 'UL':
    case 'LI':
      style = 'unordered'
    }

    const data = {
      type: 'text',
      style: style,
      items: []
    }

    if (tag === 'LI') {
      data.items = [element.innerHTML]
    } else {
      data.items = Array
        .from(element.querySelectorAll('LI'))
        .map(li => li.innerHTML)
        .filter(item => Boolean(item.trim()))
    }

    this.data = data

    this.container.innerHTML = ''
    this.data.items.forEach(item => {
      make('li', this.CSS.item, { innerHTML: item }, this.container)
    })
  }

  // Sanitizer data before saving
  static get sanitize() {
    return {
      items: {},
    }
  }

  // Define the types of paste that should be handled by this tool.
  static get pasteConfig() {
    return { tags: ['OL', 'UL', 'LI'] }
  }

  // Allow native enter behaviour
  static get enableLineBreaks() {
    return true
  }
}
