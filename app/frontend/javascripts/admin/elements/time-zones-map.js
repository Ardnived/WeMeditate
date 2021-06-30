import $ from 'jquery'
import * as topojson from 'topojson-client'
import { json } from 'd3'
import { geoMiller } from 'd3-geo-projection'
import { geoPath } from 'd3-geo'

/** TimeZones
 * To render the time zone map
 */

export default class TimeZoneMap {
  constructor(element) {
    console.log('loading TimeZones.js') // eslint-disable-line no-console

    this.map = element
    if (!this.map) {
      return
    }

    const width = 975
    const projection = geoMiller()
    const path = geoPath(projection)

    const [[x0, y0], [x1, y1]] = geoPath(projection.fitWidth(width, { type: 'Sphere' })).bounds({ type: 'Sphere' })
    const height = Math.ceil(y1 - y0)
    const l = Math.min(Math.ceil(x1 - x0), height)
    projection.scale(projection.scale() * (l - 1) / l).precision(0.2)

    this.loadData((land, zones, mesh) => {
      const groupedZones = {}
      zones.forEach(z => {
        let key = parseInt(z.properties.name)

        if (key in groupedZones) {
          groupedZones[key].push(z)
        } else {
          groupedZones[key] = [z]
        }
      })

      const groups = []
      for (const key in groupedZones) {
        const group = groupedZones[key]
        const zones = group.map(z => `<path d="${path(z)}"><title>${z.properties.places} ${z.properties.time_zone}</title></path>`)
        groups.push(`<g data-zone="${key}">${zones}</g>`)
      }

      const map = `<svg viewBox="0 30 ${width} ${height - 200}" stroke-linejoin="round">
        ${groups.join('')}
        <g pointer-events="none">
          <path fill="none" stroke="#000" d="${path(mesh)}"></path>
          <path fill-opacity="0.1" d="${path(land)}"></path>
        </g>
      </svg>`

      this.map.innerHTML = map

      if (this.map.dataset.interactive) {
        this.input = this.map.previousSibling
        const values = this.input.value.split(',')
        this.selectedZones = new Set()

        for (const i in values) {
          let zoneId = values[i]
          if (zoneId == null) continue

          zoneId = parseInt(zoneId)
          if (zoneId >= -12 && zoneId <= +14) {
            this.selectedZones.add(zoneId.toString())
            this.map.classList.add(`selected--${zoneId}`)
          }
        }

        $(this.map).find('[data-zone]').click(event => this.toggleSelected(event.currentTarget.dataset.zone, event))
      } else {
        let featured_streams = JSON.parse(this.map.dataset.featuredStreams)
        featured_streams = new Map([...Object.entries(featured_streams)].sort((a, b) => { return parseInt(a[0]) - parseInt(b[0]) }))
        const ids = Array.from(new Set(featured_streams.values()))

        featured_streams.forEach((stream_id, time_zone) => {
          $(this.map).find(`[data-zone="${time_zone}"]`).addClass(`colour--${ids.indexOf(stream_id) + 1}`)
        })
      }
    })
  }

  loadData(callback) {
    json('https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json').then(topology => {
      const land = topojson.feature(topology, topology.objects.land)
      json('https://gist.githubusercontent.com/mbostock/f0ae25cf1f057d443ca903277e3eb330/raw/254996390d4e19ef5eb1429103e0138ad08e19d0/timezones.json').then(timezones => {
        const zones = topojson.feature(timezones, timezones.objects.timezones).features
        const mesh = topojson.mesh(timezones, timezones.objects.timezones)
        callback(land, zones, mesh)
      })
    })
  }

  toggleSelected(zoneId, _event) {
    const active = this.map.classList.toggle(`selected--${zoneId}`)

    if (active) {
      this.selectedZones.add(zoneId)
    } else {
      this.selectedZones.delete(zoneId)
    }

    this.input.value = Array.from(this.selectedZones).join(',')
  }
}
