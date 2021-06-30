import $ from 'jquery'
import zenscroll from 'zenscroll'
import { getHeader } from './header'

export default class CategoriesMenu {

  constructor(element) {
    this.container = element
    this.filters = element.querySelector('.inspiration__filters')

    window.addEventListener('scroll', _event => this._onScroll())

    if (typeof zenscroll !== 'undefined') {
      this._onScroll()
    }
  }

  init() {
    this._onScroll()
  }

  _onScroll() {
    let scrollTop = $(window).scrollTop()
    const header = getHeader()

    if (scrollTop > header.stickyPoint) {
      if (!this.container.classList.contains('filters--sticky')) {
        this.container.style.height = `${$(this.container).outerHeight()}px`
        this.container.classList.add('filters--sticky')
      }
      this.filters.style.top = `${header.navigationHeight}px`
    } else {
      this.container.style.height = 'auto'
      this.filters.style.top = '0'
      this.container.classList.remove('filters--sticky')
    }
  }
}