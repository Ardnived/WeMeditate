import $ from 'jquery'
import { generateId, make } from '../util'
import { translate, locale } from '../../i18n'
import EditorTool from './_editor-tool'

export default class CatalogTool extends EditorTool {
  static get toolbox() {
    return {
      icon: '<i class="sitemap icon"></i>',
      title: translate('blocks.catalog.label'),
    }
  }

  constructor({data, _config, api}) {
    super({ // Data
      id: data.id || generateId(),
      title: data.title || '',
      items: data.items || [],
      type: ['articles', 'treatments', 'meditations'].includes(data.type) ? data.type : 'articles',
      style: ['image', 'text', 'title'].includes(data.style) ? data.style : 'image',
      decorations: data.decorations || {},
    }, { // Config
      id: 'catalog',
      fields: {
        title: { contained: true },
      },
      tunes: {
        type: {
          options: [
            { name: 'articles', icon: 'file text' },
            { name: 'treatments', icon: 'sun' },
            { name: 'meditations', icon: 'fire' },
            //{ name: 'stream', icon: 'film' }
            //{ name: 'map', icon: 'map marker' },
          ]
        },
        style: {
          options: [
            { name: 'image', icon: 'image outline' },
            { name: 'text', icon: 'align left' },
            { name: 'title', icon: 'heading' },
          ]
        },
      },
      decorations: {
        sidetext: {},
      },
    }, api)

    this.selectedItems = {}

    this.CSS.items = `${this.CSS.container}__items`
    this.CSS.itemsEmpty = `${this.CSS.container}__empty`
    this.CSS.item = {
      container: `${this.CSS.container}__item`,
      image: `${this.CSS.items}__image`,
      title: `${this.CSS.items}__title`,
      text: `${this.CSS.items}__text`,
    }

    this.CSS.search = {
      container: `${this.CSS.container}__search`,
      results: `${this.CSS.container}__search_results`,
      selection: `${this.CSS.container}__search_selection`,
      item: `${this.CSS.container}__search_item`,
      input: `${this.CSS.container}__search`,
      open: `${this.CSS.container}__search_open`,
    }
  }

  render() {
    const container = super.render()
    this.itemsInput = container.querySelector(`.${this.CSS.input}[data-key="items"]`)

    const openButton = make('div', ['ui', 'tiny', 'right', 'floated', 'button'], {})
    make('i', ['cog', 'icon'], {}, openButton)
    make('span', '', { innerText: 'Change Items' }, openButton)
    openButton.addEventListener('click', () => this.openModal())
    container.prepend(openButton)

    this.itemsContainer = make('div', [this.CSS.items, 'ui', 'list'], {}, container)
    this.itemsContainer.addEventListener('click', event => this._clickHandler(event))

    const dimmer = make('div', ['ui', 'active', 'inverted', 'dimmer'], {}, this.itemsContainer)
    make('div', ['ui', 'text', 'loader'], { innerText: 'Loading' }, dimmer)

    // Render Modal
    this.modal = make('div', ['ui', 'tiny', 'modal'])
    $(this.modal).modal({ onApprove: () => this.approveModal() })

    make('div', 'header', { innerText: 'Search for We Meditate Content' }, this.modal)
    const modalContent = make('div', ['content', this.CSS.search.container], {}, this.modal)
    modalContent.addEventListener('click', event => this._clickHandler(event))

    const searchInputWrapper = make('div', ['ui', 'fluid', 'icon', 'input'], {}, modalContent)
    this.searchInput = make('input', [this.CSS.search.input, this.CSS.semanticInput], {
      placeholder: translate('placeholders.search'),
    }, searchInputWrapper)

    make('i', ['search', 'icon'], {}, searchInputWrapper)
    this.searchInput.addEventListener('keyup', event => this._onSearchChange(event))
    this.searchResultContainer = make('div', [this.CSS.search.results, 'ui', 'list'], {}, modalContent)
    this.searchSelectionContainer = make('div', [this.CSS.search.selection, 'ui', 'list'], {}, modalContent)

    const modalFooter = make('div', 'actions', {}, this.modal)
    make('div', ['ui', 'cancel', 'button'], { innerText: 'Cancel' }, modalFooter)
    make('div', ['ui', 'green', 'ok', 'button'], { innerHTML: '<i class="check icon"></i> Select' }, modalFooter)

    this.loadItems()
    return container
  }

  loadItems() {
    if (this.data.items.length) {
      $.get(`/${locale()}/${this.data.type}.json`, {
        ids: this.data.items.join(','),
      }, data => {
        console.log('got', data)
        this.selectedItems[this.data.type] = data
        this.displayItems(data)
      }, 'json')
    } else {
      this.displayItems([])
    }
  }

  displayItems(items) {
    this.itemsContainer.innerHTML = ''

    if (items.length) {
      items.forEach(item => {
        this.itemsContainer.appendChild(this.renderItem(item))
      })
    } else {
      make('div', [this.CSS.itemsEmpty], { innerText: 'Add items using the "Change Items" button' }, this.itemsContainer)
    }
  }

  renderItem(item = {}) {
    const container = make('div', this.CSS.item.container, { data: item })
    const img = make('div', [this.CSS.item.image, 'ui', 'rounded', 'image'], {}, container)
    make('img', null, { src: item.preview }, img)
    make('div', [this.CSS.item.title], { innerText: item.name }, container)
    make('p', [this.CSS.item.text], { innerText: item.excerpt }, container)

    return container
  }

  renderModalItem(item, selected = true) {
    const container = make('div', 'item', { data: item })
    const state = selected ? 'check' : 'plus'
    make('i', [state, 'circle', 'link', 'icon'], {}, container)
    make('div', 'content', { innerText: item.name }, container)

    return container
  }

  openModal() {
    this.searchInput.value = ''
    this.searchResultContainer.innerHTML = ''
    this.searchSelectionContainer.innerHTML = ''
    this.draftItems = this.currentSelectedItems.slice() // clone array

    if (this.draftItems.length) {
      this.draftItems.forEach(item => {
        this.searchSelectionContainer.appendChild(this.renderModalItem(item))
      })
    }

    $(this.searchInput).focus()
    $(this.modal).modal('show')
  }

  _onSearchChange(event) {
    if (this.timer) clearTimeout(this.timer)
    if (event.target.value.length < 3) {
      this.searchInput.parentNode.classList.remove('loading')
      return
    }

    this.searchInput.parentNode.classList.add('loading')
    this.timer = setTimeout(() => {
      $.get(`/${locale()}/${this.data.type}.json`, {
        q: event.target.value,
        exclude: this.draftItems.map(item => item.id).join(','),
      }, data => {
        this.searchResultContainer.innerHTML = ''
        
        if (data.length) {
          data.forEach(item => {
            const el = this.renderModalItem(item, false)
            el.dataset.id = item.id
            this.searchResultContainer.appendChild(el)
          })
        } else {
          this.searchResultContainer.innerText = translate('no_results')
        }

        this.searchInput.parentNode.classList.remove('loading')
      }, 'json')
    }, 1000)
  }

  _clickHandler(event) {
    if (!event.target.classList.contains('link') || !event.target.classList.contains('icon')) {
      return
    }

    const icon = event.target
    const item = icon.parentNode

    if (icon.classList.contains('plus')) {
      // Add the item
      icon.classList.replace('plus', 'check')
      this.draftItems.push(item.dataset)
      this.searchSelectionContainer.appendChild(item)
    } else {
      // Remove the item
      this.draftItems = this.draftItems.filter(i => {
        return i.id != item.dataset.id
      })
      item.remove()
    }
  }

  approveModal() {
    this.data.items = this.draftItems.map(i => i.id)
    this.selectedItems[this.data.type] = this.draftItems
    this.displayItems(this.draftItems)
  }

  validate(blockData) {
    return super.validate(blockData) || blockData.items.length > 0
  }

  selectTune(tune) {
    const currentType = this.data.type
    super.selectTune(tune)

    // If the type changes we clear the items data
    if (tune.group == 'type' && currentType != tune.name) {
      const selectedItems = this.currentSelectedItems
      if (selectedItems && selectedItems.length) {
        this.data.items = selectedItems.map(i => i.id)
        this.displayItems(selectedItems)
      } else {
        this.data.items = []
        this.displayItems([])
      }
    }
  }

  get currentSelectedItems() {
    return this.selectedItems[this.data.type] || []
  }

  pasteHandler(_event) {
    // TODO: Handle the paste
  }

  static get pasteConfig() {
    return {
      patterns: {
        image: /https?:\/\/(www.)?wemeditate\.com\/(articles|meditations|techniques)\/\S+$/i,
      }
    }
  }

  static get sanitize() {
    return {
      title: {},
    }
  }

  static get enableLineBreaks() {
    return true
  }

  static get contentless() {
    return false
  }
}
