
class QuoteTool extends EditorTool {
  static get toolbox() {
    return {
      icon: '<i class="quote left icon"></i>',
      title: translate['content']['blocks']['quote'],
    }
  }

  // Sanitizer data before saving
  static get sanitize() {
    return {
      text: false,
      credit: false,
      caption: false,
    }
  }

  constructor({data, _config, api}) {
    super({ // Data
      text: data.text || '',
      credit: data.credit || '',
      caption: data.caption || '',
      callout: ['left', 'right'].includes(data.callout) ? data.callout : '',
    }, { // Config
      id: 'quote',
      fields: {
        text: { label: translate['content']['placeholders']['quote'], input: 'textarea' },
        credit: { input: 'caption' },
        caption: { input: 'caption' },
      },
      tunes: [
        {
          name: 'left',
          icon: 'indent',
          group: 'callout',
        },
        {
          name: 'right',
          icon: 'horizontally flipped indent',
          group: 'callout',
        },
      ],
    }, api)
  }

  selectTune(tune) {
    if (this.isTuneActive(tune)) {
      this.setTuneValue(tune.group, '')
    } else {
      super.selectTune(tune)
    }
  }

  // Empty tool is not empty Block
  static get contentless() {
    return false;
  }
}
