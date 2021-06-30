import Rails from '@rails/ujs'
import Turbolinks from 'turbolinks'

import 'core-js/stable'
import 'regenerator-runtime/runtime'

// Copy all static fonts and images to the output folder
const images = require.context('../images', true)
const imagePath = (name) => images(name, true)

// Load CSS
import '../stylesheets/public.scss'

// Load Javascript
Rails.start()
Turbolinks.start()

import '../javascripts/public'
