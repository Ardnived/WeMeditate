import $ from 'jquery'
import { updateLazyloader } from '../images'

export default class Loadmore {

  constructor(element, index) {
    this.container = element
    this.target = element.previousSibling
    this.button = element.querySelector('button, a')
    this.template = element.querySelector('template')
    this.index = index

    if (this.button.href) {
      this.button.href = `${this.button.href}&loadmore=${index}`
    }

    if (this.template) {
      this.button.addEventListener('click', _event => this.loadTemplate())
    }
  }

  addContent(content) {
    const event = new Event('contentchange')
    event.detail = content

    $(this.target).append(content)
    updateLazyloader()
    this.target.dispatchEvent(event)
  }

  loadTemplate() {
    this.addContent(this.template.content)
    this.container.style.display = 'none'
  }

  setLoadMoreUrl(url = null) {
    if (url) {
      this.button.href = `${url}&loadmore=${this.index}`
    } else {
      this.container.style.display = 'none'
    }
  }

}
