import Macy from 'macy'

export default class Grid {

  constructor(element) {
    this.container = element
    this.id = element.id
    this.allowMultiple = {}
    this.activeFilters = {}

    // Sets number of columns when screen width is above each breakpoint.
    const maxColumns = parseInt(element.dataset.maxColumns) || 4
    const breakAt = { 550: 2 }
    if (maxColumns > 2) breakAt[768] = 3
    if (maxColumns > 3) breakAt[1112] = 4

    this.macy = new Macy({
      container: this.container,
      //trueOrder: true,
      mobileFirst: true,
      columns: 1,
      breakAt: breakAt,
      margin: 5,
    })

    this.macy.recalculate(true, true)

    // Some grids may be hidden with an inline style to prevent flicker.
    // Now that macy is initialize we should re-show it.
    element.style.display = 'block'

    this.container.addEventListener('contentchange', _event => {
      // This looks like a double call, but for whatever reason it's needed.
      this.macy.recalculate(true, true)

      this.macy.runOnImageLoad(() => {
        this.macy.recalculate(true, true)
      })
    })
  }

  unload() {
    this.macy.remove()
  }

}
