
let Admin = {
  load: function() {
    console.log('loading Admin.js')
    Admin.initialize($(document.body))

    $('form').on('submit', function() {
      $(this).addClass('loading')
      $('#loader').addClass('active')
    })

    $('#pagination').on('click', 'a', function() {
      $('#loader').addClass('active')
    })

    $('.sort-list').each(function() {
      Sortable.create(this, {
        handle: ".handle",
        draggable: ".sortable",
      })

      var list = $(this)
      list.closest('form').on('submit', function() {
        list.children('.sortable').each(function(index) {
          $(this).children('.sorting-order').val(index + 1)
        })
      })
    })
  },

  initialize: function(scope) {
    scope.find('.ui.checkbox').checkbox()
    scope.find('.tabs > *').tab()
    scope.find('.ui.accordion').accordion()
    scope.find('.ui.date.picker').calendar({ type: 'date' })
    autosize(scope.find('textarea'))

    $('.ui.dropdown').each(function() {
      var element = $(this)
      element.dropdown()

      // This is a workaround to fix default values for a multiple select
      // TODO: Is this workaround still necessary?
      if (element.hasClass('multiple')) {
        var selected = []
        selected.push(element.find('option:selected').val())
        element.dropdown('set selected', selected)
        element.children('input[type="hidden"]').val(null)
      }
    })

    RepeatableFields.initialize(scope)

    scope.find('.rich-text-editor').each(function() {
      let input = $(this).prev('input')
      let quill = new Quill(this, {
        formats: [ 'link', 'bold', 'italic', 'underline' ],
        modules: {
          toolbar: [
            ['link'],
            ['bold', 'italic', 'underline'],
          ],
        },
        theme: 'snow',
      })

      quill.on('text-change', function() {
        input.val(quill.root.innerHTML)
      })
    })
  },

}

$(document).on('turbolinks:load', Admin.load)
