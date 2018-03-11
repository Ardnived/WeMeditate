
const Grid = {
  container: null, // To be defined on load
  active_filters: {},

  load: function() {
    Grid.container = $('#grid')

    if (Grid.container.length) {
      Grid.container.isotope({
        itemSelector: 'article',
      })

      $('nav.filters').each(Grid._init_group)
    }
  },

  _init_group: function() {
    const group = this.dataset.group
    const allow_multiple = (typeof this.dataset.multiple !== 'undefined')

    $(this).children('a').each(function() {
      if ($(this).hasClass('active')) {
        Grid.toggle_filter_by(group, this.dataset.filter, allow_multiple)
      }
    })

    $(this).children('a').on('click', function(e) {
      let active = Grid.toggle_filter_by(group, this.dataset.filter, allow_multiple)

      if (!allow_multiple && active) {
        $(this).siblings('.active').removeClass('active')
      }

      $(this).toggleClass('active', active)
      e.preventDefault()
    })
  },

  toggle_filter_by: function(group, filter, allow_multiple) {
    let current_filter = Grid.active_filters[group]
    let active = true

    if (allow_multiple) {
      if (Array.isArray(current_filter)) {
        const index = $.inArray(filter, current_filter)
        if (index === -1) {
          current_filter.push(filter)
        } else {
          current_filter.splice(index, 1)
          active = false
        }
      } else {
        current_filter = [filter]
      }
    } else {
      if (current_filter == filter) {
        current_filter = null
        active = false
      } else {
        current_filter = filter
      }
    }

    Grid.active_filters[group] = current_filter
    Grid.apply_filters()
    return active
  },

  apply_filters: function() {
    let filters = []

    for (const key in Grid.active_filters) {
      if (Array.isArray(Grid.active_filters[key])) {
        filters = filters.concat(Grid.active_filters[key])
      } else {
        filters.push(Grid.active_filters[key])
      }
    }

    console.log('Filter grid by', filters.join(''))

    Grid.container.isotope({
      filter: filters.join('')
    })
  },

}

$(document).on('turbolinks:load', function() { Grid.load() })
console.log('loading Grid.js')
  