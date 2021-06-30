- [About WeMeditate](#about-wemeditate)
    - [Browser Support](#browser-support)
- [Getting Started](#getting-started)
  - [Setup](#setup)
  - [Framework & Languages](#framework--languages)
  - [Concepts](#concepts)
    - [Translation / Drafting](#translation--drafting)
    - [Content Editor](#content-editor)
    - [Image, Audio, and Videos](#image-audio-and-videos)
    - [Inline SVGs](#inline-svgs)
    - [CMS Code](#cms-code)
  - [Models](#models)
      - [Pages](#pages)
      - [Resources](#resources)
      - [Filters](#filters)
      - [People](#people)
  - [Code Structure](#code-structure)
- [Deployment & Infrastructure](#deployment--infrastructure)
- [External Libraries and Services](#external-libraries-and-services)
  - [Libraries](#libraries)
  - [Services](#services)

# About WeMeditate
The WeMeditate project is comprehensive website promotig the practice of meditation through the techniques of Sahaja Yoga meditation. This website is designed to be translated to almost any language world wide and provide the following features:
 - **Guided meditations**, which can be generated based on your goal and available time.
 - **Meditation music**, by various musicians with different styles and instruments.
 - **Inspirational articles** related to meditation, spirituality, and creativity.
 - **Informative articles** about the benefits of meditation, and answering common questions about meditation. These will appear in the Inspiration section alongside the inspirational articles.
 - **Techniques** for helping enter the state of meditation, and clearing imbalances.
 - **In-depth pages** on chakras, the kundalini, the subtle subtle system, Sahaja Yoga, Shri Mataji, etc. These are available under the "Learn More" tab
 - **Map of free meditation classes worldwide**, this feature is still under construction.

Knowing the above features will also help one understand broadly what is going on in the code.

### Browser Support
We support only the most recent versions of Chrome, Safari, Firefox, Edge, and Opera - including the mobile versions of these browsers. No other browser is officially supported. Internet Explorer is not supported.

# Getting Started
There are several concepts which are common throughout the codebase that it will help to be aware of.

## Setup
- Install Postgres on your computer (for Mac, I recommend [Postgress.app](https://postgresapp.com)), for windows you can try the [official installer](https://www.postgresql.org/download/windows/).
- Clone this repository
- Run `rails db:setup` to create and populate the database.
- Run `rails server` to run the server.

Once the server is running you should be able to can access these urls
 - [localhost:3000](http://localhost:3000) for the english website
 - [ru.localhost:3000](http://ru.localhost:3000) for the russian website
 - [it.localhost:3000](http://it.localhost:3000) for the italian website
 - [admin.localhost:3000](http://admin.localhost:3000) for the admin site

When accessing the admin site you will be asked to login, in the development environment you can use a simple dropdown (shown under the login window) to select which account you want to be logged in as, without having to enter a password.

## Framework & Languages
 - **Ruby on Rails** is our core server framework. If you are not familiar with Ruby, I recommend looking through [this summary](https://learnxinyminutes.com/docs/ruby/) of how to do standard programming things in Ruby.
 - **Postgres** is our database architecture. However, Rails takes care of almost all the details of this, so 
 - **Vanilla JavaScript** is used for client side programming. jQuery is currently included as well, but we prefer not to use it when it can be avoided.
 - **Sass** is used for stylesheets. Sass is basically the same as CSS, but has a more clean syntax and allows you to use variables and basic functions. Otherwise it uses all the same selectors and attributes as CSS. We also use a library called [Autoprefixer](https://github.com/ai/autoprefixer-rails), which automatically add any necessary prefixes (like `-webkit-`) to your CSS rules. So it is not necessary for you to add these yourself. [Sass Documentation](https://sass-lang.com/guide).
 - **Slim** is used for HTML markup. As Sass does for CSS, Slim does for HTML. It creates a cleaner markup to allow us to write HTML more easily. [Slim Documentation](http://slim-lang.com).

## Concepts
There are a few pointers that it will be helpful to know when navigating the codebase.

### Translation / Drafting
Almost every model in this project can be translated, and most of them can also save a draft version of the model, for a administrator to later approve. This allows the site to have users with multiple levels of access who can propose changes to the site which are then later approved.

However this cross-section of Translaton and Drafting, and also image uploads creates some of the most difficult challenges in the code base, which you will often encounter.

Generally speaking most drafting code is contained to the Draftable concern, and most translation code to the Translatable concern. However these often bleed into other parts of the code.

### Content Editor
The website's content is build using independent blocks that can be shuffled, reorganized and tweaked in the CMS. This is done using a visual block-based editor called EditorJS (formerly the CodeX Editor).

This means that much of the CSS and Html is segmented along the lines of these "blocks", unaware of the context in which they are being rendered.

### Image, Audio, and Videos
Images and audio are hosted simply on Google Cloud storage and uploaded to via the Carrierwave gem.

However the Video hosting is a little bit more complicated. All our videos are hosted on Vimeo. When the video is hosted on the WeMeditate Vimeo Pro account then we embed it using our custom HTML5 player (using the Afterglow js library), however other vimeo videos must fallback to the Vimeo player.

Those vimeo videos that use the HTML5 player must have vimeo metadata loaded, and must have download links in the metadata (that is why we can only use HTML5 for Vimeo Pro videos)

An additional complication is that some videos, such as those on the Meditation and Treatment pages also have vertical versions of those videos, which are used for mobile. JS/CSS code is set up to switch between these two orientations.

### Inline SVGs
In many parts of the code we render SVGs inline so that we can then manipulate them using CSS. Unfortunately we use two methods to accomplish this inlining. One is the `inline_svg` gem/method on the server side, which is the preferred method. However some SVGs must be inlined using JavaScript and the `js-inline-svg` class. This is because those SVGs are hosted externally (on Google Cloud) and the `inline_svg_tag` method is not able to handle them.

Ideally we would find a solution to remove the `js-inline-svg` method, and only using `inline_svg_tag`, but for the moment this is how it works.

### CMS Code
The entirety of the CMS rails code is heavily abstracted, because all these models are managed in almost the same patterns. As such, you wll not see the normal rails views folder structures. Instead there is just one `index`, `show`, `edit`, and `new` view for the whole CMS, and each model is rendered using partials within these views.

## Models
Each model corresponds to a table in the database, and collectively these form the core of the website's content. Here is a brief overview of the models used in this site, and how they correspond to site features.

#### Pages
 - **Article**, these create the main blog feature which is present on the "Inspiration" page.
 - **SubtleSystemNode**, these defined the contnent of the pages for each chakra and channel.
 - **StaticPage**, any page on the site which doesn't directly represent a model is controlled by a Static Page model. For example: home page, inspiration page, subtle system page, classes near me, contact us, sahaja yoga page, shri mataji page, etc.

#### Resources
 - **Meditation**, a guided meditation with an associated video and a brief description
 - **Track**, a musical track for the music player.
 - **Treatment**, a meditation technique which are shown in the "Improving Meditation" section.

#### Filters
These are used to categorize other types of models
 - **Category**, groups articles by topic.
 - **DurationFilter**, groups meditations into approximate durations (eg. 5 minutes, 10 minutes, 15 minutes).
 - **GoalFilter**, groups guided meditations by what they focus on.
 - **Artist**, groups music tracks by who performed them.
 - **InstrumentFilter**, groups music tracks by which instruments are used.
 - **MoodFilter**, a currently disabled feature which used to group music tracks by their general mood.

#### People
 - **User**, anybody who can login and modify the site's content is a user.
 - **Author**, this model defined a picture and short bio for the author of any given article. It can also be associated with a "User" (aka admin), so that we can track which users wrote which articles.

## Code Structure
This is mainly useful for those who are not already familiar with Ruby on Rails. This is just a quick overview of the most important folders and files to help you find what you're looking for.

- `/app` - the core files that make this website happenn
  - `/assets` - images, fonts, javascript, and css
    - `/fonts` - custom fonts for the site
    - `/images` - all images used by the site
    - `/javascripts/admin` - javascript for the site's admin interface
    - `/javascripts/front` - javascript for the public-facing website
    - `/stylesheets/admin` - sass for the site's admin interface
    - `/stylesheets/front` - sass for the public-facing website
    - `/stylesheets/mixins` - common sass variables and functions which are shared between the public-site and admin interface.
  - `/controllers` - contains the classes which handle the URL endpoints that are set up in `/config/routes.rb`
  - `/helpers` - extra methods that can be used in the "view" files.
  - `/models` - the classes that handle access to the database.
    - `/concerns` - small independent bits of functionality that are shared across multiple models
  - `/policies` - defines the rules for what actions a logged-in user can take in the site.
  - `/uploaders` - configuration for different kinds of image uploads
  - `/views` - where we render html
- `/db/migrate` - where we define changes to the database
- `/config` - overall configurationn of the project
  - `/locales` - translation files for every language.
  - `/routes.rb` - defines the URLs that our server accepts
- `/public` - contains files that can be accessed simply by adding their path to the end of the website's url.
- `/Gemfile` - this file defines the Ruby packages which get bundle and installed with the server.

# Deployment & Infrastructure
The project's servers and hosted and deployed using Heroku. Any changes which are pushed to the `master` branch will be automatically deployed to the staging server (en.staging-wemeditate.com). If you need access to the staging server, please ask and a login will be created for you.

Once a change has been verified on the staging server it can be deployed to production in the Heroku dashboard.

# External Libraries and Services
If you are implementing a new feature that touches on one of these areas, please use the existing integration or library.

## Libraries
This is a list of some of the key libraries that are used to manage major features.

*Ruby Gems:*
 - *Devise*, user login
 - *Regulator*, user permissions
 - *Globalize*, model translations
 - *CarrierWave*, file uploads

*JavaScript Libraries:*
 - *EditorJS*, block-based content editing
 - *Afterglow*, html5 video player
 - *Amplitude*, audio player
 - *Macy*, creates masonry-like grid layouts
 - *Lity*, lightbox (deprecated)
 - *Zenscroll*, smooth scrolling

*CSS Libraries:*
 - *Semantic UI*, css framework used for the admin/CMS pages

## Services
This is a list of all external services used by the WeMeditate project.

This list is provided for reference, to help track down various parts of the site.

 - *Heroku*, server hosting
 - *Google Cloud Storage*, file storage
 - *Vimeo*, video storage
 - *G Suite For Business*, for an email inbox to send emails from
 - *Klaviyo*, for mailing list campaigns
 - *Google Analytics*, to track website traffic
 - *Google Tag Manager*, to embed analytics and klaviyo, and implement custom analytics events
 - *SY Directory*, for a map of meditation programs worldwide (not yet implemented)
 - *Namecheap*, for domain name registration
 - *Rollbar*, for error tracking

G Suite and Namecheap may only be accessed with the sydevelopers.com account, but all other accounts can be set up for people to use their personal accounts.

All accounts are managed and billed by the sydevelopers.com account.
