source 'https://rubygems.org'
ruby '2.4.3'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?("/")
  "https://github.com/#{repo_name}.git"
end


# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 5.1.4'
# Use postgresql as the database for Active Record
gem 'pg', '~> 0.18'
# Use Puma as the app server
gem 'puma', '~> 3.7'
# Use SCSS for stylesheets
gem 'sassc-rails'
# Use Slim for views
gem 'slim-rails'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'
# See https://github.com/rails/execjs#readme for more supported runtimes
# gem 'therubyracer', platforms: :ruby

# Use CoffeeScript for .coffee assets and views
#gem 'coffee-rails', '~> 4.2'
# Turbolinks makes navigating your web application faster. Read more: https://github.com/turbolinks/turbolinks
gem 'turbolinks', '~> 5'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.5'
# Use Redis adapter to run Action Cable in production
# gem 'redis', '~> 3.0'
# Use ActiveModel has_secure_password
# gem 'bcrypt', '~> 3.1.7'

# Use Capistrano for deployment
# gem 'capistrano-rails', group: :development

# Users
gem 'devise'
gem 'devise_invitable'
gem 'regulator'

# Front End
gem 'normalize-rails' # To normalize CSS
gem 'autoprefixer-rails' # For automatic cross browser CSS compatibility
gem 'semantic-ui-sass'
gem 'jquery-rails'
gem 'sortable-rails'
gem 'google-tag-manager-rails'
gem 'jquery-slick-rails' # A slider library
gem 'inline_svg' # To embed svg files

# Models
gem 'paper_trail'
gem 'friendly_id'
gem 'geocoder'
gem 'jsonb_accessor'

# Uploads
gem 'carrierwave'
gem 'carrierwave-google-storage'
gem 'mini_magick'
gem 'rack-raw-upload'

# Admin
gem 'simple_form'
gem 'autosize' # To automatically grow text areas
gem 'quilljs-rails' # A wysiwyg text editor

# Globalize (translatable models)
gem 'globalize'
gem 'friendly_id-globalize'
gem 'carrierwave_globalize', github: 'Ardnived/carrierwave_globalize' # for multiple uploaders support
#gem 'carrierwave_globalize', path: '~/Documents/Projects/Other/carrierwave_globalize' # for multiple uploaders support
gem 'globalize-versioning', github: 'aaroncraigie/globalize-versioning' # for paper_trail support

# Localization
gem 'rails-i18n'
gem 'carrierwave-i18n'
gem 'i18n_data'
gem 'devise-i18n'
gem 'route_translator'

# Tools
gem 'sprig'

# Misc
gem 'gibbon' # For MailChimp Integration
gem 'mail_form' # For the contact form
gem 'sidekiq' # To power active jobs

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  # Adds support for Capybara system testing and selenium driver
  gem 'capybara', '~> 2.13'
  gem 'selenium-webdriver'
end

group :development do
  # Access an IRB console on exception pages or by using <%= console %> anywhere in the code.
  gem 'web-console', '>= 3.3.0'
  gem 'listen', '>= 3.0.5', '< 3.2'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
  gem 'better_errors'
  gem 'binding_of_caller'
  gem 'switch_user', github: 'tslocke/switch_user'
  gem 'i18n_generators'
  gem 'letter_opener'
  gem 'dotenv'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]
