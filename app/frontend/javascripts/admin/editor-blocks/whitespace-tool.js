import { generateId, make } from '../util'
import { translate } from '../../i18n'
import EditorTool from './_editor-tool'

export default class TextTool extends EditorTool {
  static get toolbox() {
    return {
      icon: '<i class="minus icon"></i>',
      title: translate('blocks.whitespace.label'),
    }
  }

  constructor({data, _config, api}) {
    super({ // Data
      id: data.id || generateId(),
      size: ['small', 'medium', 'large'].includes(data.size) ? data.size : 'medium',
      decorations: data.decorations || {},
    }, { // Config
      id: 'whitespace',
      fields: {},
      tunes: {
        size: {
          options: [
            { name: 'small', icon: 'compress' },
            { name: 'medium', icon: 'expand' },
            { name: 'large', icon: 'expand arrows alternate' },
          ]
        },
      },
      decorations: {
        triangle: {},
        gradient: {},
        circle: {},
      },
    }, api)
  }

  render() {
    this.container = super.render()
    make('span', null, { innerText: translate('blocks.whitespace.label') }, this.container)

    return this.container
  }

  validate(_blockData) {
    return true
  }

  static get contentless() {
    return true
  }
}
