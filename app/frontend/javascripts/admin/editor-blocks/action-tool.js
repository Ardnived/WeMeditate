import { generateId, make } from '../util'
import { translate } from '../../i18n'
import EditorTool from './_editor-tool'

export default class ActionTool extends EditorTool {
  static get toolbox() {
    return {
      icon: '<i class="edit icon"></i>',
      title: translate('blocks.action.label'),
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
      list_id: data.list_id || '',
      type: ['button', 'form'].includes(data.type) ? data.type : 'button',
      form: ['signup', 'contact'].includes(data.form) ? data.form : 'signup',
      spacing: ['spaced', 'compact'].includes(data.spacing) ? data.spacing : 'spaced',
      decorations: data.decorations || {},
    }, { // Config
      id: 'action',
      fields: {
        title: { label: 'Title', input: 'title', contained: true },
        subtitle: { label: 'Subtitle', contained: true },
        text: { label: 'Text', contained: true },
        action: { label: 'Button Text', input: 'button', contained: true },
        url: { input: 'url', contained: true },
        list_id: { label: 'Custom Klaviyo List ID', input: 'caption', contained: true },
      },
      tunes: {
        type: {
          options: [
            { name: 'button', icon: 'hand point up' },
            { name: 'form', icon: 'edit' },
          ]
        },
        form: {
          requires: { type: ['form'] },
          options: [
            { name: 'signup', icon: 'envelope' },
            { name: 'contact', icon: 'paper plane' },
          ]
        },
        spacing: {
          requires: { type: ['form'] },
          options: [
            { name: 'spaced', icon: 'expand' },
            { name: 'compact', icon: 'compress' },
          ]
        },
      },
      decorations: {
        leaves: { requires: { type: ['button'] } },
      },
    }, api)

    this.CSS.sample = {
      form: `${this.CSS.container}__sample-form`,
      input: `${this.CSS.container}__sample-input`,
      email: `${this.CSS.container}__sample-input--email`,
      message: `${this.CSS.container}__sample-input--message`,
    }
  }

  render() {
    const container = super.render()
    const button = container.querySelector(`.${this.CSS.input}[data-key="action"]`)
    const fields = make('div', this.CSS.sample.form)

    make('div', [this.CSS.sample.input, this.CSS.sample.email], { innerText: translate('placeholders.email') }, fields)
    make('div', [this.CSS.sample.input, this.CSS.sample.message], { innerText: translate('placeholders.message') }, fields)

    container.insertBefore(fields, button)
    return container
  }

  pasteHandler(event) {
    const element = event.detail.data
    let data = {
      action: element.innerText,
      url: element.href
    }

    this.data = data
    this.container.querySelector(`.${this.CSS.input}[data-key="action"]`).innerText = this.data.action
    this.container.querySelector(`.${this.CSS.input}[data-key="url"]`).innerText = this.data.url
  }

  // Define the types of paste that should be handled by this tool.
  static get pasteConfig() {
    return { tags: ['A'] }
  }

  // Sanitizer data before saving
  static get sanitize() {
    return {
      title: false,
      subtitle: false,
      text: false,
      action: false,
      url: false,
      list_id: false,
    }
  }
}
