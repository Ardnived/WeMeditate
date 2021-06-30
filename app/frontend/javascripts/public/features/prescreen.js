import zenscroll from 'zenscroll'

export default class Prescreen {

  constructor(element) {
    this.container = element
    this.abbreviation = element.querySelector('abbr')
    this.explanation = element.querySelector('.prescreen__explanation-wrapper')
    this.skipLink = element.querySelector('.prescreen__skip__link')

    this.abbreviation.addEventListener('click', () => this._onClickAbbreviation())
    this.skipLink.addEventListener('click', event => { return this.dismissPrescreen(event) })
  }

  dismissPrescreen(event) {
    const href = this.skipLink.getAttribute('href')
    document.cookie = 'prescreen=dismissed;max-age=31536000'
    
    if (href[0] == '#') {
      const target = document.getElementById(href.substr(1))
      zenscroll.toY(zenscroll.getTopOf(target) - 180)
      event.preventDefault()
    }
  }

  _onClickAbbreviation() {
    this.explanation.classList.toggle('prescreen__explanation-wrapper--opened')
    //this.abbreviation.classList.toggle('prescreen__abbr--active')
  }

}
