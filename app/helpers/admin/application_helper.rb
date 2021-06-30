
module Admin::ApplicationHelper

  # Admin URLs require a bit of special handling, to support all the abstraction that we do in the CMS
  def polymorphic_admin_path args, options = {}
    unless args.last.is_a?(Class)
      options[:id] = args.last.id
      options[:format] ||= nil
    end

    options[:locale] = Globalize.locale
    polymorphic_path(args, **options)
  end

  # Provides an easy link to view a set of coordinates on Google
  def coordinates_url latitude, longitude
    "https://www.google.com/maps/search/?api=1&query=#{latitude}%2C#{longitude}"
  end

  # Creates a mailto link for reporting any issues with the CMS
  def report_url
    report_url = "mailto:\"#{translate 'admin.report_issue.name'}\"<#{translate 'admin.report_issue.email'}>"
    report_url += "?subject=#{CGI.escape translate('admin.report_issue.subject')}"
    report_url += "&body=#{CGI.escape translate('admin.report_issue.body')}"
    report_url
  end

  def label_tag icon, text
    tag.div class: 'ui icon label' do
      concat tag.i class: "#{icon} icon"
      concat ' '
      concat text
    end
  end

  # This is a more complex method which generates a summary of the content blocks for a given page.
  # Just to give an overview of the page content to a user, instead of showing them the whole content.
  def content_outline record
    blocks = record.content_blocks if record.parsed_content.present?
    return unless blocks

    content_tag :ul do
      # Loop through each block in the record, and generate a short piece of text describing that block.
      for block in blocks
        case block['type']
        when 'paragraph'
          if block['data']['type'] == 'header'
            title = block['data']['text']
            concat content_tag :li, tag.strong(title)
          end

        when 'splash', 'header', 'textbox' # Bold title
          field = block['type'] == 'header' ? 'text' : 'title'
          title = block['data'][field]
          type = translate(block['data']['type'], scope: [:admin, :content, :blocks, block['type']])
          word_count = block['data']['text'] ? block['data']['text'].split.size : 0
          word_count = translate('admin.content.words', count: word_count)

          title = "#{block['data']['level']&.upcase || 'H2'} - #{title}" if block['type'] == 'header'

          concat content_tag :li, tag.strong(title)
          concat content_tag :li, tag.i("#{type}: #{word_count}") if block['type'] == 'textbox' && !block['data']['asVideo']

        when 'form' # Content
          concat content_tag :li, "#{block['type'].titleize}: #{block['data']['title']}"

        when 'video', 'structured' # Items list
          items = block['data']['items']&.map { |item| item['title'] }&.join(', ')

          case block['type']
          when 'structured'
            type = translate(block['data']['format'], scope: %i[admin content tunes format])
          else
            type = translate(block['type'], scope: %i[admin content blocks])
          end

          concat content_tag :li, "#{type.titleize}: #{items}"

        when 'paragraph', 'quote' # Word count
          type = translate(block['data']['type'], scope: [:admin, :content, :blocks, block['type']])
          word_count = translate('admin.content.words', count: block['data']['text'].split.size)
          concat content_tag :li, tag.i("#{type}: #{word_count}")

        when 'list', 'catalog', 'image' # Items count
          item_count = translate('admin.content.items', count: block['data']['items'].split.size)

          case block['type']
          when 'catalog'
            type = translate(block['data']['type'], scope: %i[admin content tunes type])
          else
            type = translate(block['type'], scope: %i[admin content blocks])
          end

          concat content_tag :li, tag.i("#{type}: #{item_count}")

        when 'action' # Short text link
          type = translate(block['data']['type'], scope: [:admin, :content, :blocks, block['type']])
          concat content_tag :li, tag.em(type) + tag.span(": [#{block['data']['text']}] → ") + tag.small(block['data']['url'])

        when 'whitespace' # Whitespace
          separators = {
            large: '==',
            medium: '—',
            small: '--',
          }

          concat content_tag :li, separators[block['data']['size'].to_sym] * 3

        else
          concat block.inspect
        end
      end
    end
  end

end
