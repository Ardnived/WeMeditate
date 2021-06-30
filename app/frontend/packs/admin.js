import Rails from '@rails/ujs'
import Turbolinks from 'turbolinks'
import 'core-js/stable'
import 'regenerator-runtime/runtime'

// Load CSS
import '../stylesheets/admin.scss'

// Load Javascript
Rails.start()
Turbolinks.start()

import '../javascripts/admin'
