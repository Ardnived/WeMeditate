export default class LanguageSwitcher {

  constructor(element) {
    this.container = element
    this.input = element.querySelector('.footer__language__input')
    this.selection = this.input.querySelector('.footer__language__selection')
    this.popup = this.input.querySelector('.footer__language__popup')

    this.selection.addEventListener('click', () => this.togglePopup())

    this.onClickElsewhere = event => {
      if (event.target.closest('.footer__language__input') == null) {
        this.popup.classList.remove('popup--open')
        document.removeEventListener('click', this.onClickElsewhere)
      }
    }

  }

  togglePopup() {
    this.popup.classList.toggle('popup--open')

    const popupOpen = this.popup.classList.contains('popup--open')

    if (popupOpen) {
      document.addEventListener('click', this.onClickElsewhere)
    } else {
      document.removeEventListener('click', this.onClickElsewhere)
    }
  }
}