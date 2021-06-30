import $ from 'jquery'
import { make, toggle } from '../util'
import { translate } from '../../i18n'

/** Editor Tool
 * This folder contains definitions for each type of block which can be used in our content editor.
 * This file contains the super class for all those tools, providing common functionality between them all.
 */

const DECORATIONS = {
  triangle: {
    icon: 'counterclockwise rotated play',
    inputs: [
      { name: 'alignment', type: 'select', default: 'left', values: ['left', 'right'] },
    ],
  },
  gradient: {
    icon: 'counterclockwise rotated bookmark',
    inputs: [
      { name: 'alignment', type: 'select', default: 'left', values: ['left', 'right'] },
      { name: 'color', type: 'select', default: 'orange', values: ['orange', 'blue', 'gray'] },
    ],
  },
  sidetext: {
    icon: 'clockwise rotated heading',
    inputs: [
      { name: 'text', type: 'text', default: '' },
    ],
  },
  circle: { icon: 'circle outline' },
  leaves: { icon: 'leaf' },
}

export default class EditorTool {

  constructor(data, config, api) {
    this.api = api // Save a reference to the EditorJS api
    this.data = data // Save data for this tool/block

    this.id = config.id // Save the id of this block, so that we can recognize if it changes
    this.fields = config.fields || {}
    this.tunes = config.tunes || {}
    this.decorations = config.decorations || {}

    for (const key in this.tunes) {
      this.tunes[key].name = key
      this.tunes[key].options.map(option => Object.assign(option, { group: key }))
    }

    for (const key in this.decorations) {
      this.decorations[key] = Object.assign({}, DECORATIONS[key], this.decorations[key], {
        name: key,
        icon: 'times',
      })
    }

    // A convenience to lookup the CSS classes used in the editor
    this.CSS = {
      wrapper: `ce-${this.id}`,
      wrapperSelected: 'cdx-block--custom-focus',
      baseClass: this.api.styles.block,
      container: `cdx-${this.id}`,

      input: this.api.styles.input,
      inputs: {},

      optionsWrapper: 'cdx-options',
      optionsHeader: 'cdx-options__header',
      optionsGroup: 'cdx-options__group',
      optionsGroupTitle: 'cdx-options__title',
      optionsButton: this.api.styles.settingsButton,
      optionsButtonActive: this.api.styles.settingsButtonActive,
      optionsButtonDisabled: `${this.api.styles.settingsButton}--disabled`,
      settingsSelect: 'ce-settings-select',
      settingsInput: 'ce-settings-input',
    }

    // A few special types of inputs also have their own CSS class
    const inputs = ['title', 'caption', 'textarea', 'text', 'content', 'button', 'url']
    inputs.forEach(name => {
      this.CSS.inputs[name] = `${this.CSS.input}--${name}`
    })
  }


  // =============== RENDERING =============== //

  // Creates the tool html with inputs
  render() {
    const container = make('div', [this.CSS.baseClass, this.CSS.container])
    this.container = container

    // Render the fields which are defined for this tool
    for (let key in this.fields) {
      const field = this.fields[key]
      if (field.input === false) continue
      this.renderInput(key, container)
    }

    return container
  }

  rendered() {
    this.wrapper = this.container.parentElement.parentElement
    this.wrapper.classList.add(this.CSS.wrapper)

    this.wrapper.addEventListener('keyup', () => this.onFocus())
    this.wrapper.addEventListener('mousedown', () => this.onFocus())
    this.wrapper.addEventListener('touchstart', () => this.onFocus())

    // Render the settings block
    this.renderSettings(this.wrapper)
    this.updateSettings()
  }

  // Renders a standard type of input
  renderInput(key, container = null) {
    let result
    let field = this.fields[key]
    let type = field.input || 'text'

    result = make('div', [this.CSS.input, this.CSS.inputs[type]], {
      type: 'text',
      data: { key: key },
      innerHTML: this.data[key],
      contentEditable: true,
    }, container)

    if (type == 'url') {
      // URL inputs should auto-prepend an HTTP protocol if no protocol is defined.
      result.addEventListener('blur', event => {
        const url = event.target.innerText
        if (url) event.target.innerText = (url.indexOf('://') === -1) ? 'http://' + url : url
      })
    }

    if (type == 'text' && field.contained != false) {
      // Text fields should prevent EditorJS from splitting pasted content into multiple blocks
      result.addEventListener('paste', event => this.containPaste(event))
    }

    if (field.contained) {
      // Any field wiith the contained attriibute set should prevent enter/backspace from creating/deleting blocks.
      result.addEventListener('keydown', event => this.inhibitEnterAndBackspace(event, false))
    }

    // Add the field's label as a placeholder, or use a default placeholder
    result.dataset.placeholder = field.label || translate(`placeholders.${key}`)

    if (field.optional) {
      // If this field is optional append that to the placeholder
      result.dataset.placeholder += ` (${translate('placeholders.optional')})`
    }

    return result
  }

  renderSettings(container = null) {
    const settingsContainer = make('div', [this.CSS.optionsWrapper], {}, container)

    make('div', this.CSS.optionsHeader, { innerText: this.constructor.toolbox.title }, settingsContainer)

    // Render tunes if there is at least one defined.
    if (Object.keys(this.tunes).length > 0) {
      this.tunesWrapper = make('div', '', {}, settingsContainer)
      Object.values(this.tunes).forEach(group => {
        this.renderTuneGroup(group, this.tunesWrapper)
      })
    }

    // Render decorations if there is at least one allowed.
    if (Object.keys(this.decorations).length > 0) {
      this.decorationsTitle = make('div', this.CSS.optionsHeader, { innerText: translate('decorations.label') }, settingsContainer)
      this.decorationsWrapper = make('div', '', {}, settingsContainer)
      Object.values(this.decorations).forEach(group => {
        this.renderDecorationGroup(group, this.decorationsWrapper)
      })
    }

    return settingsContainer
  }

  renderSettingsButton(setting, container, callback, isActive) {
    const button = make('div', [this.CSS.optionsButton], {
      data: { group: setting.group, key: setting.name },
      innerHTML: `<i class="${setting.icon} icon"></i>`
    }, container)

    button.addEventListener('click', () => {
      if (!event.currentTarget.classList.contains(this.CSS.optionsButtonDisabled)) {
        callback.call(this, setting)
      }
    })

    if (isActive) {
      button.classList.add(this.CSS.optionsButtonActive)
    }

    return button
  }

  renderTuneGroup(group, container) {
    const optionsGroup = make('div', this.CSS.optionsGroup, {
      data: { key: group.name },
    }, container)

    make('div', this.CSS.optionsGroupTitle, {
      innerText: translate(`blocks.${this.id}.${group.name}.label`)
    }, optionsGroup)

    group.options.forEach(tune => {
      const isActive = this.isTuneSelected(tune)
      this.renderSettingsButton(tune, optionsGroup, this.selectTune, isActive)
    })
  }

  renderDecorationGroup(group, container) {
    const optionsGroup = make('div', this.CSS.optionsGroup, {
      data: { key: group.name },
    }, container)

    const isActive = this.isDecorationSelected(group)
    const button = this.renderSettingsButton(group, optionsGroup, this.toggleDecoration, isActive)
    button.classList.add(`${this.CSS.optionsButton}--fluid`)
    button.innerHTML += translate(`decorations.${group.name}.label`)

    if (group.inputs) {
      group.inputs.forEach(input => {
        this.renderDecorationInput(group.name, input, optionsGroup)
      })
    }
  }

  renderDecorationInput(key, input, container) {
    const value = (this.data.decorations && this.data.decorations[key] && this.data.decorations[key][input.name]) || input.default
    let result, inputElement

    if (input.type == 'select') {
      result = make('div', [this.CSS.settingsSelect, 'ui', 'inline', 'dropdown'], {}, container)
      inputElement = make('input', 'text', { type: 'hidden' }, result)
      make('div', 'text', { innerText: translate(`decorations.${key}.${input.name}.${value}`) }, result)
      make('i', ['dropdown', 'icon'], {}, result)
      const menu = make('div', 'menu', {}, result)
      input.values.forEach(val => {
        const label = translate(`decorations.${key}.${input.name}.${val}`)
        const item = make('div', 'item', { innerText: label }, menu)
        item.dataset.value = val
      })

      $(result).dropdown()
    } else {
      result = make('div', ['ui', 'transparent', 'input', this.CSS.settingsInput], {}, container)
      inputElement = make('input', '', {
        type: input.type,
        placeholder: translate(`decorations.${key}.${input.name}`),
        value: value,
      }, result)
    }

    inputElement.addEventListener('change', event => this.setDecorationOption(key, input.name, event.target.value))
    return result
  }


  // =============== SAVING =============== //

  // Extract data from the tool element, so that it can be saved.
  save(blockContainer) {
    let newData = {}

    // Get the contents of each field for this tool.
    for (let key in this.fields) {
      newData[key] = blockContainer.querySelector(`.${this.CSS.input}[data-key=${key}]`).innerHTML
      newData[key] = newData[key].replace('&nbsp;', ' ').trim() // Strip non-breaking whitespace
    }

    this.removeInactiveData()
    return Object.assign(this.data, newData)
  }

  validate(blockData) {
    const fields = Object.keys(this.fields)

    for (let i = 0; i < fields.length; i++) {
      const value = blockData[fields[i]]
      if (typeof value === 'string' && new String(value).trim() !== '') {
        return true
      } else if (value) {
        return true
      }
    }

    return false
  }

  removeInactiveData() {
    for (const key in this.tunes) {
      if (!this.isSettingAvailable(this.tunes[key])) {
        delete this.data[key]
      }
    }
    
    for (const key in this.decorations) {
      if (!this.isSettingAvailable(this.decorations[key])) {
        delete this.data.decorations[key]
      }
    }
  }

  get isEmpty() {
    return this.validate()
  }


  // =============== SETTINGS STATE =============== //

  updateSettings() {
    this.updateTuneClasses()
    this.updateTuneButtons()
    this.updateDecorationGroups()
    this.updateDecorationButtons()
  }

  updateTuneClasses() {
    for (const key in this.tunes) {
      const group = this.tunes[key]
      if (this.isSettingAvailable(group)) {
        this.wrapper.dataset[group.name] = this.data[group.name]
      } else {
        delete this.wrapper.dataset[group.name]
      }
    }
  }

  // Updates the appearance of all settings buttons and inputs to reflect the current state of the block.
  updateTuneButtons() {
    if (!this.tunesWrapper) return

    for (const key in this.tunes) {
      const group = this.tunes[key]
      const groupWrapper = this.tunesWrapper.querySelector(`.${this.CSS.optionsGroup}[data-key=${key}]`)
      const isActive = this.isSettingAvailable(group)
      toggle(groupWrapper, isActive)
      groupWrapper.querySelector(`.${this.CSS.optionsGroupTitle}`).dataset.label = translate(`blocks.${this.id}.${group.name}.${this.data[group.name]}`)
      
      if (isActive) {
        for (let i = 0; i < group.options.length; i++) {
          const tune = group.options[i]
          const tuneButton = groupWrapper.querySelector(`.${this.CSS.optionsButton}[data-key=${tune.name}]`)
          const isActive = this.isTuneSelected(tune)
          tuneButton.classList.toggle(this.CSS.optionsButtonActive, isActive)
        }
      }
    }
  }

  updateDecorationGroups() {
    if (!this.decorationsWrapper) return

    let atleastOneDecoration = false
    for (const key in this.decorations) {
      const group = this.decorations[key]
      const groupWrapper = this.decorationsWrapper.querySelector(`.${this.CSS.optionsGroup}[data-key=${key}]`)
      const isActive = this.isSettingAvailable(group)
      toggle(groupWrapper, isActive)
      if (isActive) atleastOneDecoration = true
    }

    toggle(this.decorationsTitle, atleastOneDecoration)
  }

  updateDecorationButtons() {
    if (!this.decorationsWrapper) return

    for (const key in this.decorations) {
      const decoration = this.decorations[key]
      const button = this.decorationsWrapper.querySelector(`.${this.CSS.optionsButton}[data-key=${key}]`)
      const isActive = this.isDecorationSelected(decoration)
      button.classList.toggle(this.CSS.optionsButtonActive, isActive)
    }
  }

  // Check if a tune if currently selected.
  isSettingAvailable(setting) {
    if (!setting.requires) return true

    const requires = Array.isArray(setting.requires) ? setting.requires : [setting.requires]
    for (let i = 0; i < requires.length; i++) {
      const ruleGroup = requires[i]
      let result = true
      for (const key in ruleGroup) {
        let success = ruleGroup[key].find(value => {
          return this.isSettingAvailable(this.tunes[key]) && this.data[key] === value
        })

        result = result && Boolean(success)
        if (!result) break
      }

      if (result) return true
    }

    return false
  }

  // Check if a tune if currently selected.
  isTuneSelected(tune) {
    return this.data[tune.group] === tune.name
  }

  isDecorationSelected(decoration) {
    return this.data.decorations && Boolean(this.data.decorations[decoration.name])
  }

  selectTune(tune) {
    this.data[tune.group] = tune.name
    this.updateSettings()
  }

  toggleDecoration(decoration, selected = null) {
    if (selected == null) {
      selected = !this.isDecorationSelected(decoration)
    }

    if (decoration.inputs && selected) {
      if (!this.data.decorations[decoration.name] || this.data.decorations[decoration.name].constructor != Object) {
        const data = {}
        decoration.inputs.forEach(input => { data[input.name] = input.default })
        this.data.decorations[decoration.name] = data
      }
    } else {
      this.data.decorations[decoration.name] = selected
    }

    this.updateDecorationButtons()
  }

  setDecorationOption(key, option, value) {
    if (this.data.decorations[key].constructor != Object) {
      this.data.decorations[key] = {}
    }
    
    this.data.decorations[key][option] = value
  }

  // =============== PASTE HANDLING =============== //

  onPaste(event) {
    this.pasteHandler(event)
    this.updateSettings()
  }

  // Paste content directly into the tool, bypassing EditorJS's normal behaviour.
  containPaste(event) {
    const clipboardData = event.clipboardData || window.clipboardData
    const pastedData = clipboardData.getData('Text')
    document.execCommand('insertHTML', false, pastedData)
    event.stopPropagation()
    event.preventDefault()
    return false
  }


  // =============== MISCELLENEOUS =============== //

  // This prevents the default EditorJS behaviour for the enter and backspace buttons
  inhibitEnterAndBackspace(event, insertNewBlock = false) {
    if (event.key == 'Enter' || event.keyCode == 13) { // ENTER
      if (insertNewBlock) this.api.blocks.insert() // Insert a block if allowed
      event.stopPropagation()
      event.preventDefault()
      return false
    } else if (event.key == 'Backspace' || event.keyCode == 8) { // BACKSPACE
      event.stopImmediatePropagation()
      return false
    } else {
      return true
    }
  }

  // This will insert a paragraph break if the enter button is pressed.
  insertParagraphBreak(event) {
    if (event.key == 'Enter' || event.keyCode == 13) { // ENTER
      document.execCommand('insertHTML', false, '\r\n')
      event.preventDefault()
      event.stopPropagation()
      return false
    }
  }

  onFocus() {
    if (this.wrapper.classList.contains(this.CSS.wrapperSelected)) {
      return
    }

    const selectedBlock = this.wrapper.parentElement.getElementsByClassName(this.CSS.wrapperSelected)
    
    if (selectedBlock.length > 0) {
      selectedBlock[0].classList.remove(this.CSS.wrapperSelected)
    }

    this.wrapper.classList.add(this.CSS.wrapperSelected)
  }
}
