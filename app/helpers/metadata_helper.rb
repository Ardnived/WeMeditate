module MetadataHelper

  ORGANIZATION = {
    '@type' => 'Organization',
    'name' => I18n.translate('we_meditate'),
    'logo' => {
      '@type' => 'ImageObject',
      'url' => ApplicationController.helpers.image_path('header/logo.svg'),
      #'width' => 0, # TODO Define this
      'height' => 60,
    },
    'sameAs' => I18n.translate('social_media').values.reject(&:empty?),
  }.freeze

  def render_metatags
    return unless @metatags.present?

    capture do
      @metatags.each do |key, value|
        if key == 'title'
          if action_name == 'home'
            if value.present?
              concat tag.title "#{translate 'we_meditate'} | #{value}"
            else
              concat tag.title translate('we_meditate')
            end
          else
            concat tag.title "#{value} | #{translate 'we_meditate'}"
          end
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

  def render_structured_data
    return unless @structured_data.present?

    tag.script @structured_data.to_json.html_safe, type: 'application/ld+json'
  end

  def metatags record = nil
    if record.present?
      @metatags ||= Rails.cache.fetch "#{record.cache_key_with_version}/metatags" do
        (record.metatags || {}).reverse_merge(default_metatags(record))
      end
    else
      @metatags ||= default_metatags
    end
  end

  def default_metatags record = nil
    @default_metatags ||= begin
      tags = {
        'description' => translate('tagline'),
        'og:site_name' => translate('we_meditate'),
        'og:url' => request.original_url,
        'og:locale' => locale,
        'og:locale:alternate' => I18n.available_locales.map(&:to_s),
        'twitter:site' => Rails.application.config.twitter_handle,
        'twitter:creator' => Rails.application.config.twitter_handle,
      }

      set_record_metatags!(tags, record) if record.present?
      tags['og:title'] = tags['title']
      tags['og:description'] = tags['description']
      tags
    end
  end

  def structured_data record
    metatags(record)
    return unless @metatags.present?

    @structured_data ||= Rails.cache.fetch "#{record&.cache_key_with_version}/metadata" do
      ([
        build_page_metadata(record, @metatags),
        build_event_metadata(record, @metatags),
        build_video_metadata(record, @metatags),
        build_listing_metadata(record, @metatags),
        build_breadcrumbs_metadata(record, @metatags),
      ] + build_content_metadata(record, @metatags)).compact
    end
  end

  private

    def set_record_metatags! tags, record
      tags['title'] = record.name
      tags['description'] = record.excerpt if record.respond_to?(:excerpt)
      tags['og:type'] = 'article'
      tags['og:image'] = record.thumbnail.url if record.respond_to?(:thumbnail)
      tags['og:locale:alternate'] = record.translated_locales.map(&:to_s)
      tags['og:article:published_time'] = record.created_at.to_s(:db)
      tags['og:article:modified_time'] = record.updated_at.to_s(:db)
      tags['og:article:section'] = record.category&.name if record.is_a?(Article)
      tags['twitter:card'] = 'summary'

      set_static_page_metatags!(tags, record) if record.is_a?(StaticPage)
      set_video_metatags!(tags, record) if record.try(:vimeo_metadata).present?
    end

    def set_static_page_metatags! tags, record
      if record.role == 'home'
        tags['title'] = translate('we_meditate')
        image = MediaFile.find_by(id: record.content_blocks.first['data']['image']['id']) if record.content_blocks
      else
        image = MediaFile.find_by(id: record.parsed_content['media_files'].first) if defined? record.parsed_content['media_files']
      end

      tags['og:image'] = image_url image.file_url if image.present?
      tags['og:url'] = static_page_url_for(record)
      tags['og:type'] = 'website' if %w[home contact privacy articles meditations].include?(record.role)
    end

    def set_video_metatags! tags, record
      metadata = record.vimeo_metadata
      metadata = metadata[:horizontal] if metadata.key?(:horizontal)

      tags.merge!({
        'og:type' => 'video.other',
        'og:image' => metadata[:thumbnail],
        'og:video' => metadata[:download_url],
        'og:video:duration' => metadata[:duration],
        'og:video:release_date' => record.created_at.to_s(:db),
        'twitter:card' => 'player',
        'twitter:player:url' => metadata[:embed_url],
        'twitter:player:width' => metadata[:width],
        'twitter:player:height' => metadata[:height],
      })
    end

    def build_page_metadata record, tags
      data = {
        '@type' => tags['og:type'] == 'article' ? 'Article' : 'WebPage',
        '@context' => 'http://schema.org',
        'mainEntityOfPage' => {
          '@type' => 'WebPage',
          '@id' => tags['og:url'],
        },
        'publisher' => ORGANIZATION,
        'name' => tags['og:title'],
        'headline' => tags['og:title'],
        'description' => tags['og:description'],
        'datePublished' => tags['og:article:published_time'],
        'dateModified' => tags['og:article:modified_time'],
        'image' => tags['og:image'],
        'thumbnailUrl' => tags['og:image'],
        'video' => tags['og:video'],
      }

      data['@type'] = 'ContactPage' if record.try(:role) == 'contact'
      data['@type'] = 'AboutPage' if record.try(:role) == 'about'

      if data['@type'] == 'Article'
        data['headline'] = tags['og:title']

        if record.try(:author).present?
          author = {
            '@type' => 'Person',
            'name' => record.author.name,
            'jobTitle' => record.author.title,
            'nationality' => record.author.country_code,
            'image' => record.author.image_url,
          }

          data['author'] = author
          data['about'] = author if record.try(:author_type) == 'artist'
        else
          data['author'] = ORGANIZATION
        end
      end

      data
    end

    def build_event_metadata record, tags
      return unless record.try(:date).present? && record.try(:location).present?

      {
        '@type' => 'Event',
        '@context' => 'http://schema.org',
        'publisher' => ORGANIZATION,
        'name' => tags['og:title'],
        'description' => tags['og:description'],
        'startDate' => record.date.to_s(:db),
        'image' => tags['og:image'],
        'video' => tags['og:video'],
        # 'location' => {}, # TODO: Define this - https://developers.google.com/search/docs/data-types/event
      }
    end

    def build_video_metadata record, tags
      return unless record.try(:vimeo_metadata).present?

      {
        '@context' => 'http://schema.org',
        '@type' => 'VideoObject',
        'publisher' => ORGANIZATION,
        'name' => tags['og:title'],
        'description' => tags['og:description'],
        'uploadDate' => tags['og:article:published_time'],
        'image' => tags['og:image'],
        'thumbnailUrl' => tags['og:image'],
        'contentUrl' => tags['og:video'],
        'embedUrl' => tags['twitter:player:url'],
        'duration' => tags['og:video:duration'],
        'interactionCount' => record.try(:views),
      }
    end

    def build_listing_metadata record, tags
      return unless record.is_a?(StaticPage) && %w[articles meditations treatments subtle_system].include?(record.role)

      records_name = (record.role == 'subtle_system' ? 'subtle_system_nodes' : record.role)
      records = instance_variable_get("@#{records_name}")
      return unless records.present?

      if admin?
        items = "<list of #{records_name}>"
      else
        items = records.each_with_index.map do |item, index|
          {
            '@type' => 'ListItem',
            'position' => index,
            'url' => polymorphic_url(item),
          }
        end
      end

      {
        '@context' => 'https://schema.org',
        '@type' => 'ItemList',
        'itemListElement' => items,
      }
    end

    def build_breadcrumbs_metadata record, tags
      return unless @breadcrumbs.present?

      {
        '@context' => 'https://schema.org',
        '@type' => 'BreadcrumbList',
        'itemListElement' => @breadcrumbs.each_with_index.map { |crumb, index|
          {
            '@type' => 'ListItem',
            'position' => index,
            'name' => crumb[:name],
            'item' => crumb[:url] || tags['og:url'],
          }
        }
      }
    end

    def build_content_metadata record, tags
      # TODO: Further enrich the structured data by marking up FAQ accordions, Video Carousels, Image Galleries, etc.
      # See here: https://developers.google.com/search/docs/data-types/article
      []
    end

end
