import { generateId, make, translate } from '../util'
import EditorTool from './_editor-tool'

export default class TextTool extends EditorTool {
  static get toolbox() {
    return {
      icon: '<i class="minus icon"></i>',
      title: 'Whitespace',
    }
  }

  constructor({data, _config, api}) {
    super({ // Data
      id: data.id || generateId(),
      size: ['small', 'medium', 'large'].includes(data.size) ? data.size : 'medium',
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
      }
    }, api)
  }

  render() {
    this.container = super.render()
    make('span', null, { innerText: translate().content.blocks.whitespace }, this.container)

    return this.container
  }

  validate(_blockData) {
    return true
  }

  static get contentless() {
    return true
  }
}
