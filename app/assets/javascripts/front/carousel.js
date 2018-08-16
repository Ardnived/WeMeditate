
var Carousel = {
  default_options: {
    centerPadding: '6%',
    slidesToShow: 3,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          arrows: true,
          slidesToShow: 1,
          centerPadding: '0',
        }
      },
      {
        breakpoint: 640,
        settings: {
          arrows: true,
          slidesToShow: 1,
        }
      }
    ]
  },

  video_options: {
    centerPadding: '7%',
    centerMode: true,
    slidesToShow: 1,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          arrows: true,
          slidesToShow: 1,
          centerPadding: '0',
        }
      },
      {
        breakpoint: 640,
        settings: {
          arrows: true,
          centerMode: false,
          slidesToShow: 1,
        }
      }
    ]
  },

  venues_options: {
    centerPadding: '60px',
    slidesToShow: 1,
  },

  meditations_options: {
    dots: true,
    slidesToShow: 3,
    responsive: [
      {
        breakpoint: 740,
        settings: {
          arrows: true,
          slidesToShow: 1,
        }
      }
    ]
  },

  contacts_options: {},

  contacts_options: {},

  load: function() {
    console.log('loading Carousel.js')
    Carousel.columns_options = Carousel.default_options
    Carousel.contacts_options = Carousel.default_options

    $('.carousel').each(function() {
      $carousel = $(this)
      style = $carousel.data('style')

      console.log('Init carousel', $carousel)

      if (style == 'video') {
        $carousel.slick(Carousel.video_options)
      } else if (style == 'venues') {
        $carousel.slick(Carousel.venues_options)
      } else if (style == 'meditations') {
        $carousel.slick(Carousel.meditations_options)
      } else if (style == 'columns') {
        $carousel.slick(Carousel.columns_options)
      } else if (style == 'contacts') {
        $carousel.slick(Carousel.contacts_options)
      } else {
        $carousel.slick(Carousel.default_options)
      }
    })

    if (jQuery( this ).closest('.menu-item').hasClass('menu-item-type-custom')) {
      console.log('yes', jQuery( this ))
    } else {
      console.log('no', jQuery( this ))
    }
  },
}

$(document).on('turbolinks:load', function() { Carousel.load() })
