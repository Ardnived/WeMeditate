//= require jquery

/* global $, zenscroll */

class Preview {

  constructor() {
    console.log('Init Preview.js') // eslint-disable-line no-console
    this.selectedId = null
    window.addEventListener('message', event => this.onIframeMessage(event), false)

    this.disableInteractions()
    //this.observeScroll()
  }

  onIframeMessage(event) {
    if (event.origin !== window.location.origin) return

    if (event.data.action == 'highlight') {
      this.highlightBlock(event.data.id, 'message')
    } else {
      this.setApproval(event.data.id, event.data.approved)
    }
  }

  observeScroll() {
    this.observer = new IntersectionObserver(entries => this.onObserverChange(entries), {
      rootMargin: '-49% 0px -49% 0px',
    })

    $('.review-block').each((index, element) => {
      this.observer.observe(element)
    })
  }

  onObserverChange(entries) {
    if (this.disableObserver) return
    
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.highlightBlock(entry.target.dataset.id, 'block')
        return
      }
    })
  }

  disableInteractions() {
    $('a[href], button, input, select').on('click', function(event) {
      event.preventDefault()
      event.stopPropagation()
      return false
    }).on('focus', function(event) {
      event.target.blur()
      event.preventDefault()
      event.stopPropagation()
      return false
    }).css('cursor', 'not-allowed')
  }

  highlightBlock(id, source) {
    if (this.selectedId) {
      $(`.review-block[data-id="${this.selectedId}"]`).removeClass('active')
      $(`.review-button[data-id="${this.selectedId}"]`).removeClass('active')
    }

    this.selectedId = id
    const $blocks = $(`.review-block[data-id="${id}"]`).addClass('active')
    // const $buttons = $(`.review-button[data-id="${id}"]`).addClass('active')

    if (source == 'message') {
      this.disableObserver = true
      zenscroll.center($blocks[0], 1000, 0, () => { this.disableObserver = false })
    }
  }

  setApproval(id, approved) {
    $(`.review-block[data-id="${id}"]`).toggleClass('approved', approved)
  }

}

$(document).on('ready', () => { new Preview() })
