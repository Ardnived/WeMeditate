export default class Dropdown {

  constructor(element) {
    this.container = element
    this.selectionContainer = element.querySelector('.dropdown__selection')
    this.input = element.querySelector('.js-dropdown-input')

    const items = element.querySelectorAll('.dropdown__item')
    for (let index = 0; index < items.length; index++) {
      items[index].addEventListener('click', event => this.selectItem(event.currentTarget))
    }

    this.selectionContainer.addEventListener('click', _event => this.togglePopup())
    element.querySelector('.dropdown__close').addEventListener('click', _event => this.togglePopup(false))

    this.onClickElsewhere = event => {
      if (event.target.closest('.dropdown') == null) {
        this.togglePopup(false)
      }
    }
  }

  togglePopup(forceState = null) {
    const openPopup = (forceState === null ? !this.container.classList.contains('dropdown--open') : forceState)

    if (openPopup) {
      document.addEventListener('click', this.onClickElsewhere)
    } else {
      document.removeEventListener('click', this.onClickElsewhere)
    }

    this.container.classList.toggle('dropdown--open', openPopup)
    document.body.classList.toggle('noscroll', openPopup)
  }

  selectItem(item) {
    const svg = item.querySelector('svg')
    const text = item.querySelector('.dropdown__item__text').innerText
    const firstGroupElement = svg.querySelector('g, path, ellipse, rect')
    const color = firstGroupElement.getAttribute('stroke') || firstGroupElement.getAttribute('fill')

    if (item.parentNode) {
      const activeItem = item.parentNode.querySelector('.dropdown__item--active')
      if (activeItem) activeItem.classList.remove('dropdown__item--active')
    }

    this.input.value = item.dataset.value

    const dropdownIcon = this.selectionContainer.querySelector('.dropdown__selection__icon')
    dropdownIcon.style.background = color

    const dropdownText = this.selectionContainer.querySelector('.dropdown__selection__text')
    dropdownText.innerText = text
    dropdownText.style.color = color ? color : 'gray'
    this.selectionContainer.querySelector('svg').replaceWith(svg.cloneNode(true))
    this.selectionContainer.classList.remove('dropdown__selection--inactive')

    const event = new Event('change')
    event.detail = item
    this.container.dispatchEvent(event)

    this.togglePopup() // Aka, close it
  }

}
