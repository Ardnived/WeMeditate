/** Accordion
 * Allows an accordion block to be opened and closed.
 */

export default class Accordion {

  constructor(element) {
    this.container = element
    this.activeItem = null

    const textElements = element.querySelectorAll('.js-accordion-text')
    for (let index = 0; index < textElements.length; index++) {
      textElements[index].style.maxHeight = textElements[index].offsetHeight + 'px'
    }

    const titleElements = element.querySelectorAll('.js-accordion-title')
    for (let index = 0; index < titleElements.length; index++) {
      titleElements[index].addEventListener('click', event => this.selectItem(event.currentTarget.parentNode))
      titleElements[index].parentNode.classList.add('closed')
    }
  }

  unload() {
    const textElements = this.container.querySelectorAll('.js-accordion-text')
    for (let index = 0; index < textElements.length; index++) {
      textElements[index].parentNode.classList.remove('closed')
      textElements[index].style.maxHeight = null
    }

    this.activeItem = null
  }

  selectItem(item) {
    if (this.activeItem) {
      this.activeItem.classList.add('closed')
    }

    if (this.activeItem != item) {
      this.activeItem = item
      this.activeItem.classList.remove('closed')
    } else {
      this.activeItem = null
    }
  }

}
