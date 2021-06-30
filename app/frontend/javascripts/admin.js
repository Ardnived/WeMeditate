require('semantic-ui-css/semantic')
require('semantic-ui-calendar/dist/calendar')

import { load } from './admin/application'

document.addEventListener('turbolinks:load', load)