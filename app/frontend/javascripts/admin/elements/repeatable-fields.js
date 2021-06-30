import $ from 'jquery'
import { init } from '../application'
require('repeatable-fields')

/** Repeatable Fields
 * This code allows us to create groups of fields which can be duplicated to make a list.
 * For example, this is used by the Metatags field on most models.
 */

const ATTR_NAME_REGEX = /\[([\w_]+)\]\[\]$/

function onAdd(_container, $new_row) {
  // Whenever a new row is added a list of repeatable fields,
  // then we need to initialize any dropdowns or other javascript-reliant content in those fields.
  init($new_row)
}

export default class RepeatableFields {

  constructor(container) {
    // We are using a repeatable fields library
    $(container).repeatable_fields({
      //row_count_placeholder: '{{row-count-placeholder}}',
      remove: '.remove',
      move_up: '.move-up',
      move_down: '.move-down',
      is_sortable: true,
      after_add: onAdd,
    })
  }

  // Reset the set of repeatable fields to use the given list of values.
  static reset($fieldset, values) {
    let $container = $fieldset.find('.container')
    let $template = $container.find('.template').clone().removeClass('template').show()

    // Strip any disabled attributes from the new row template
    $template.find(':input').each(function() {
      $(this).prop('disabled', false)
    })

    // Remove all the rows except the template
    $container.children('.row:not(.template)').remove()

    // For each value create a new row.
    values.forEach(function(data) {
      let $row = $template.clone()
      let $fields = $row.children('.fields-wrapper').children()

      $fields.each(function() {
        if (this.tagName == 'INPUT' || this.tagName == 'TEXTAREA') {
          // Extract the name of this field, and get it's value from the data
          let key = ATTR_NAME_REGEX.exec(this.name)[1]
          this.value = data[key]
        } else {
          // Any other type of field is not supported
          console.error('Resetting', this.tagName, 'fields is currently not supported for repeatable fields.') // eslint-disable-line no-console
        }
      })

      onAdd($container[0], $row)
      $container.append($row)
    })
  }
}
