
const Draft = {
  load() {
    console.log('loading Draft.js')
    $('.draft.field .reset.button').on('click', Draft._on_set)
    $('.draft.field .redo.button').on('click', Draft._on_set)
    $('.repeatable.draft.field .reset.button').on('click', Draft._on_reset_repeatable)
  },

  _on_set() {
    let $trigger = $(this)
    let $field = $trigger.closest('.field')
    let value = $trigger.data('value')
    $field.toggleClass('draft')

    switch ($field.data('draft')) {
      case 'string':
        $field.find('input').val(value)
        break
      case 'text':
        $field.find('textarea').val(value)
        break
      case 'rich_text':
        let quill = Quill.find($field.find('.rich-text-editor')[0])
        quill.setText('')
        quill.clipboard.dangerouslyPasteHTML(value)
        break
      case 'collection':
      case 'association':
        $field.find('.ui.selection').dropdown('set selected', value)
        break
      case 'media':
        Media.set_input($field.find('.ui.media.input'))
        Media.set_value(value)
        break
      case 'repeatable':
        RepeatableFields.reset($field, value)
        break
      case 'content':
        Editor.instance.render(value)
        break
      default:
        console.error('TODO: Draft reset is not yet implemented for', $field.data('draft'))
    }
  },
}

$(document).on('turbolinks:load', () => { Draft.load() })
