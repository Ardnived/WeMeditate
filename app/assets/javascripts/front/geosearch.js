/* globals */
/* exported GeoSearch */

class GeoSearch {

  constructor(container) {
    this.container = container
    this.config = {
      access_token: container.dataset.key,
      format: 'json',
      autocomplete: true,
      language: document.documentElement.lang,
      types: 'country,region,postcode,district,place,locality,neighborhood,address',
    }

    this.config = Object.keys(this.config).map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(this.config[key])
    }).join('&')

    this.searchResults = container.querySelector('.js-geosearch-results')
    this.searchInput = container.querySelector('input')
    this.searchInput.addEventListener('input', _event => this.refreshGeoSearch())
    this.searchInput.addEventListener('keydown', event => this.handleKeyPress(event.code, event.keyCode))
    this.searchInput.addEventListener('focus', _event => this.setActive(true))

    if (this.searchInput.value) {
      this.refreshGeoSearch()
    }
  }

  setActive(active) {
    const isActive = this.container.classList.contains('classes__splash--active')
    if (isActive == active) return

    this.container.classList.toggle('classes__splash--active', active)
  }

  refreshGeoSearch() {
    const searchText = this.searchInput.value

    if (searchText.length < 3) {
      this.searchResults.innerHTML = null
      return
    }

    this.container.classList.add('classes__splash--loading')

    this.query(searchText, results => {
      this.searchResults.innerHTML = null

      results.forEach(result => {
        const query = Object.keys(result).map((key) => {
          return encodeURIComponent(key) + '=' + encodeURIComponent(result[key])
        }).join('&')

        const element = document.createElement('A')
        element.tabIndex = '0'
        element.href = `/map?${query}`
        element.innerText = result.q
        this.searchResults.appendChild(element)
        this.setActive(true)
      })
      
      setTimeout(() => {
        this.container.classList.remove('classes__splash--loading')
      }, 1000)
    })
  }

  handleKeyPress(keyName, keyCode) {
    if (keyName == 'Enter' || keyCode === 13) {
      this.selectFocusedElement()
    } else if (event.code == 'ArrowDown' || event.keyCode === 40) {
      this.moveFocusDown()
    } else if (event.code == 'ArrowUp' || event.keyCode === 38) {
      this.moveFocusUp()
    }
  }

  /* ===== SEARCH RESULT FOCUS ===== */

  selectFocusedElement() {
    if (this.focusedItem) {
      this.focusedItem.click()
    } else {
      this.searchResults.firstElementChild.click()
    }
  }

  clearFocus() {
    if (this.focusedItem) {
      this.focusedItem.classList.remove('focus')
      this.focusedItem = null
    }
  }

  moveFocusUp() {
    if (this.focusedItem) {
      this.focusedItem.classList.remove('focus')
      this.focusedItem = this.focusedItem.previousElementSibling
    }

    if (!this.focusedItem) {
      this.focusedItem = this.searchResults.lastElementChild
    }

    this.focusedItem.classList.add('focus')
  }

  moveFocusDown() {
    if (this.focusedItem) {
      this.focusedItem.classList.remove('focus')
      this.focusedItem = this.focusedItem.nextElementSibling
    } 
    
    if (!this.focusedItem) {
      this.focusedItem = this.searchResults.firstElementChild
    }

    this.focusedItem.classList.add('focus')
  }

  // ===== API CALLS ===== //

  query(text, callback) {
    this.latestQuery = text
    this.waiting = true

    this.fetch(text).then(data => {
      if (text == this.latestQuery) {
        console.log('[GeoSearchAPI]', text, data) // eslint-disable-line no-console
        this.waiting = false
        callback(this.parseServiceResponse(data.features))
      } else {
        console.log('[GeoSearchAPI]', 'Ignored expired request:', text) // eslint-disable-line no-console
      }
    }).catch(error => {
      console.error('[GeoSearchAPI]', 'Error:', error) // eslint-disable-line no-console
    })
  }

  parseServiceResponse(data) {
    const results = []
    
    // Showing only 8 results for now, potentially increase/descrease the number
    for (let i = 0; i < data.length; i++) {
      const dat = data[i]
      let result = {
        q: dat.place_name,
        latitude: dat.center[1],
        longitude: dat.center[0],
        type: dat.place_type[0],
      }

      if (['country', 'region', 'district'].includes(result.type)) {
        result.west = dat.bbox[0]
        result.south = dat.bbox[1]
        result.east = dat.bbox[2]
        result.north = dat.bbox[3]
      }

      results.push(result)
    }

    return results
  }

  async fetch(text) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${text}.json?${this.config}`

    // Default options are marked with *
    const response = await fetch(url, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      /*
      mode: 'no-cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *client
      headers: {
        'Content-Type': 'application/json'
      },
      */
    })

    return await response.json() // parses JSON response into native JavaScript objects
  }

}
