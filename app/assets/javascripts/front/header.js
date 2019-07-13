
class Header {

  constructor(element) {
    this.container = element
    this.scrollspy = document.getElementById('scrollspy-progress')
    this.cookieNotice = document.querySelector('.header__notice--cookie')
    this.splash = document.querySelector('.js-splash')
    this.container.style.height = 'auto'
    this.navigationHeight = $('.header__navigation', element).outerHeight(true)

    this.desktopWrapper = element.querySelector('.header__wrapper--desktop')
    this.mobileWrapper = element.querySelector('.header__wrapper--mobile')

    element.querySelector('.header__navigation__burger').addEventListener('click', _event => this.toggleMenu())
    $(element).on('click', '.header__menu__item--submenu > a', event => {
      this.toggleSubmenu(event.target)
      event.preventDefault()
    })

    document.body.classList.remove('noscroll')
    this.container.classList.remove('header--show-menu')

    window.addEventListener('resize', _event => this._onResize())
    window.addEventListener('scroll', _event => this._onScroll())

    this.container.classList.toggle('header--overlay', this.splash)
    this.container.classList.toggle('header--invert', this.splash && this.splash.dataset.invert)

    let $scrollspyTarget = $('.scrollspy-target')
    if (this.scrollspy) {
      if ($scrollspyTarget.length > 0) {
        this.scrollspyTop = $scrollspyTarget.offset().top
        this.scrollspyHeight = $scrollspyTarget.height()
        this.scrollspy.style.display = null
      } else {
        this.scrollspy.style.display = 'none'
      }
    }

    if (this.cookieNotice) {
      const cookieNoticeClose = this.cookieNotice.querySelector('.header__notice__close')
      cookieNoticeClose.addEventListener('click', () => {
        this.cookieNotice.remove()
        document.cookie = 'notice=dismissed'
      })

      setTimeout(() => { if (this.cookieNotice) this.cookieNotice.style.bottom = '0' }, 5000)
    }
  }

  init() {
    this._onResize()
    this._onScroll()
  }

  toggleMenu() {
    let show = !this.container.classList.contains('header--show-menu')
    this.container.classList.toggle('header--show-menu', show)
    document.body.classList.toggle('noscroll', show)
  }

  toggleSubmenu(element) {
    element.closest('.header__menu__item--submenu').classList.toggle('header__menu__item--expand')
  }

  _onResize() {
    const isDesktop = $(this.desktopWrapper).is(':visible')
    this.headerHeight = $(isDesktop ? this.desktopWrapper : this.mobileWrapper).outerHeight(true)
    this.stickyPoint = isDesktop ? this.headerHeight - this.navigationHeight : 0
    zenscroll.setup(null, this.headerHeight)

    if (this.splash && this.splash.dataset.invert) {
      this.inversionPoint = $(this.splash).outerHeight() - this.navigationHeight
    } else {
      this.inversionPoint = 0
    }
  }

  _onScroll() {
    let scrollTop = $(window).scrollTop()

    if (scrollTop > this.stickyPoint) {
      // Enable sticky-ing
      if (!this.container.classList.contains('header--sticky')) {
        this.container.style.height = `${$(this.container).outerHeight()}px`
        this.container.classList.add('header--sticky')
        if (this.cookieNotice) this.cookieNotice.style.bottom = '0'
      }
    } else {
      this.container.style.height = 'auto'
      this.container.classList.remove('header--sticky')
    }

    if (this.inversionPoint > 0) {
      this.container.classList.toggle('header--invert', scrollTop < this.inversionPoint)
    }

    if (this.scrollspy && this.scrollspyTop) {
      let percentage = 0

      if (scrollTop >= this.scrollspyTop && this.scrollspyHeight >= window.innerHeight) {
        percentage = Math.min(1, (scrollTop - this.scrollspyTop) / (this.scrollspyHeight - window.innerHeight)) * 100
      }

      this.scrollspy.style.width = `${percentage}%`
    }
  }
}
