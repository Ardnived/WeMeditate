module MetadataHelper

  ORGANIZATION = {
    '@type' => 'Organization',
    'name' => I18n.translate('we_meditate'),
    'logo' => {
      '@type' => 'ImageObject',
      'url' => ApplicationController.helpers.image_path('header/logo-small.svg'),
    },
    'sameAs' => I18n.translate('social_media').values,
  }

  def render_metatags record
    capture do
      metatags(record).each do |key, value|
        if key == 'title'
          concat tag.title "#{value} | #{translate 'we_meditate'}"
        elsif key == 'description'
          concat tag.meta name: 'description', content: value
        elsif value.is_a? Array
          value.each do |val|
            concat tag.meta property: key, content: val
          end
        else
          concat tag.meta property: key, content: value
        end
      end
    end
  end

  def render_structured_data record
    tag.script structured_data(record).to_json.html_safe, type: 'application/ld+json'
  end

  def metatags record
    @metatags ||= begin
      tags = (record.metatags || {}).reverse_merge(default_metatags(record))
      if record.is_a? City
        (static_page_preview_for(:city).metatags || {}).merge(tags)
      else
        tags
      end
    end
  end

  def default_metatags record
    @default_metatags ||= begin
      tags = {
        'og:site_name' => translate('we_meditate'),
        'og:url' => polymorphic_url(record),
        'og:locale' => locale,
        'og:locale:alternate' => record.translated_locales.map(&:to_s),
        'og:article:published_time' => record.created_at.to_s(:db),
        'og:article:modified_time' => record.updated_at.to_s(:db),
        'twitter:site' => Rails.application.config.twitter_handle,
        'twitter:creator' => Rails.application.config.twitter_handle,
        'title' => record.name,
      }

      if record.reviewable?
        tags['og:article:modified_time'] = (record.published_at || record.updated_at).to_s(:db)
      end

      case record
      when Article
        if record.video.present?
          tags.merge!({
            'description' => record.excerpt,
            'og:type' => 'video.other',
            'og:image' => record.thumbnail.url,
            'og:video' => record.video.url,
            'og:video:duration' => '', # TODO: Define this
            'og:video:release_date' => record.created_at.to_s(:db),
            'twitter:card' => 'player',
            #'twitter:player:url' => '', # TODO: We must have an embeddable video iframe to reference here.
            #'twitter:player:width' => '',
            #'twitter:player:height' => '',
          })
        else
          tags.merge!({
            'description' => record.excerpt,
            'og:type' => 'article',
            'og:image' => record.banner&.url || record.thumbnail.url,
            'og:article:section' => record.category.name,
            'twitter:card' => record.banner.present? ? 'summary_large_image' : 'summary',
            'og:video' => record.video&.url,
            #'og:video:duration' => '', # TODO: Define this
          })
        end
      when StaticPage
        is_article = ['about', 'shri_mataji', 'subtle_system', 'sahaja_yoga', 'tracks', 'meditations', 'treatments'].include? record.role
        tags['title'] = translate('we_meditate') if record.role == 'home'

        tags.merge!({
          'og:url' => static_page_url_for(record),
          'og:type' => is_article ? 'article' : 'website',
          'og:article:modified_time' => (record.published_at || record.updated_at).to_s(:db),
          'twitter:card' => 'summary',
        })
      when City
        tags.merge!({
          'og:type' => 'article',
          'og:image' => record.banner.url,
          'og:article:modified_time' => (record.published_at || record.updated_at).to_s(:db),
          'geo.placename' => record.name,
          'geo.position' => "#{record.latitude}; #{record.longitude}", # TODO: Determine if we should actually be defining this, since a city is larger than a set of coords.
          #'geo.region' => '' # TODO: Determine if we should define this. This is apparently the state/province code
          'twitter:card' => 'summary_large_image',
        })
      when Meditation, Treatment
        tags.merge!({
          'og:type' => 'video.other',
          'og:image' => record.thumbnail.url,
          'og:video' => record.video.url,
          'og:video:duration' => '', # TODO: Define this
          'og:video:release_date' => record.created_at.to_s(:db),
          'twitter:card' => 'player',
          #'twitter:player:url' => '', # TODO: We must have an embeddable video iframe to reference here.
          #'twitter:player:width' => '',
          #'twitter:player:height' => '',
        })
      when SubtleSystemNode
        tags.merge!({
          'og:type' => 'article',
          'twitter:card' => 'summary',
        })
      end

      tags.merge!({
        'og:title' => tags['title'],
        'og:description' => tags['description'],
      })
    end
  end

  def structured_data record
    tags = metatags(record)
    @structured_data ||= begin
      objects = []
      page = {
        '@context' => 'http://schema.org',
        'mainEntityOfPage' => {
          '@type' => 'WebPage',
          '@id' => tags['og:url'],
        },
        'publisher' => ORGANIZATION,
        'name' => tags['og:title'],
        'description' => tags['og:description'],
        'datePublished' => tags['og:article:published_time'],
        'dateModified' => tags['og:article:modified_time'],
        'image' => tags['og:image'],
        'video' => tags['og:video'],
      }

      objects.push(page)

      case record
      when Article
        page.merge!({
          '@type' => 'Article',
          'headline' => tags['og:title'],
          'thumbnail_url' => record.thumbnail.url,
        })

        if record.date
          objects.push({
            '@context' => 'http://schema.org',
            '@type' => 'Event',
            'publisher' => ORGANIZATION,
            'name' => tags['og:title'],
            'description' => tags['og:description'],
            'startDate' => record.date.to_s(:db),
            'image' => tags['og:image'],
            'video' => tags['og:video'],
            #'location' => {}, # TODO: Define this - https://developers.google.com/search/docs/data-types/event
          })
        end

        if record.video.present?
          objects.push({
            '@context' => 'http://schema.org',
            '@type' => 'VideoObject',
            'publisher' => ORGANIZATION,
            'name' => tags['og:title'],
            'description' => tags['og:description'],
            'thumbnail_url' => record.thumbnail.url,
            'uploadDate' => tags['og:article:published_time'],
            'image' => tags['og:image'],
            'contentUrl' => tags['og:video'],
            'embedUrl' => tags['twitter:player:url'],
            'duration' => tags['og:video:duration'],
          })
        end
      when StaticPage
        if ['about', 'shri_mataji', 'sahaja_yoga', 'tracks'].include? record.role
          page.merge!({
            '@type' => 'Article',
            'headline' => tags['og:title'],
            'thumbnail_url' => tags['og:image'],
          })
        elsif 'contact'
          # TODO: Add special markup for this page
          page.merge!({
            '@type' => 'WebPage',
          })
        else
          page.merge!({
            '@type' => 'WebPage',
          })
        end

        if ['articles', 'meditations', 'treatments', 'tracks', 'subtle_system'].include? record.role
          list = {
            '@context' => 'https://schema.org',
            '@type' => 'ItemList',
            'itemListElement' => {},
          }

          records_name = (record.role == 'subtle_system' ? 'subtle_system_nodes' : record.role)

          if 'admin'
            list['itemListElement'] = "<list of #{records_name}>"
          else
            list['itemListElement'] = instance_variable_get("@#{records_name}").each_with_index.map { |record, index|
              {
                '@type' => 'ListItem',
                'position' => index,
                'url' => polymorphic_url(record),
              }
            }
          end

          objects.push list
        end
      when Meditation, Treatment
        page.merge!({
          '@type' => 'VideoObject',
          'publisher' => ORGANIZATION,
          'thumbnail_url' => record.thumbnail.url,
          'uploadDate' => tags['og:article:published_time'],
          'contentUrl' => tags['og:video'],
          'embedUrl' => tags['twitter:player:url'],
          'duration' => tags['og:video:duration'],
          'interactionCount' => (record.views if defined? record.views), # TODO: Make sure that we use a consistent increasing number here, and maybe make treatments support it
        })
      when SubtleSystemNode
        page.merge!({
          '@type' => 'Article',
          'headline' => tags['og:title'],
        })
      end

      if @breadcrumbs
        objects.push {
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": @breadcrumbs.each_with_index.map { |crumb, index|
              {
                '@type' => 'ListItem',
                'position' => index,
                'name' => crumb[:name],
                'item' => crumb[:url] || tags['og:url'],
              }
            }
          }
        }
      end

      objects
    end
  end

end
