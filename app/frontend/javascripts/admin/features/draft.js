import $ from 'jquery'
import RepeatableFields from '../elements/repeatable-fields'
import { setContent } from './editor'

/** Draft
 * This sets up a few simple handlers that let us toggle between draft values and live values for an input field.
 */

export default function init() {
  console.log('loading Draft.js') // eslint-disable-line no-console
  $('.draft.field .reset.button').on('click', toggle)
  $('.draft.field .redo.button').on('click', toggle)
}

function toggle() {
  let $trigger = $(this)
  let $field = $trigger.closest('.field')
  let value = $trigger.data('value')
  $field.toggleClass('draft')

  // Handle the code necessary to set each different type of draftable field.
  switch ($field.data('draft')) {
  case 'string':
    $field.find('input').val(value)
    break
  case 'text':
    $field.find('textarea').val(value)
    break
  case 'date':
    $field.find('.ui.date.picker').calendar('set date', value)
    break
  case 'toggle':
    $field.find('.ui.checkbox').checkbox(value ? 'check' : 'uncheck')
    break
  case 'collection':
  case 'association':
    $field.find('.ui.selection').dropdown('set selected', value)
    break
  case 'media':
    $field.find('img').attr('src', value.src)
    $field.find('input[type=hidden]').attr('value', value.id)
    break
  case 'latlng':
    $field.find('input[data-draft=latitude]').attr('value', value.length < 1 ? null : value[0])
    $field.find('input[data-draft=longitude]').attr('value', value.length < 2 ? null : value[1])
    break
  case 'repeatable':
    if ($field.data('attribute') == 'metatags') {
      value = Object.entries(value).map(pair => {
        return { keys: pair[0], values: pair[1] }
      })
    }

    RepeatableFields.reset($field, value)
    break
  case 'content':
    setContent(value)
    break
  default:
    console.error('Draft reset is not yet implemented for', $field.data('draft')) // eslint-disable-line no-console
  }
}
