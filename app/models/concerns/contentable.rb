## CONTENTABLE CONCERN
# This concern should be added to models have arbitrary body content

module Contentable

  extend ActiveSupport::Concern

  def contentable?
    true
  end

  included do |base|
    %i[content].each do |column|
      next if base.try(:translated_attribute_names)&.include?(column) || base.column_names.include?(column.to_s)
      throw "Column `#{column}` must be defined to make the `#{base.model_name}` model `Contentable`"
    rescue ActiveRecord::NoDatabaseError, ActiveRecord::StatementInvalid # rubocop:disable Lint/HandleExceptions
      # avoid breaking rails db:create / db:drop etc due to boot time execution
    end

    base.has_many :media_files, as: :page, inverse_of: :page, dependent: :delete_all
    # base.validates :content, presence: true

    def self.contentable?
      true
    end
  end

  def parsed_content
    return nil unless self[:content].present?
    self[:content].is_a?(Hash) ? self[:content] : JSON.parse(self[:content])
  end

  def content_blocks
    if self[:content].present?
      parsed_content['blocks']
    else
      []
    end
  end

  def media_file media_file_id
    media_files.find_by(id: media_file_id)&.file
  end

  def essential_media_files locale = nil
    result = []

    if locale.nil?
      translated_locales.each do |locale|
        result += essential_media_files(locale)
      end
    else
      Globalize.with_locale(locale) do
        if content_blocks.present?
          content_blocks.each do |block|
            result += block['data']['mediaFiles'] if block['data']['mediaFiles']
          end
        end

        result += [thumbnail_id] if self.has_attribute?(:thumbnail_id)

        if draftable? && has_draft?
          if parsed_draft_content.present?
            parsed_draft_content['blocks'].each do |block|
              result += block['data']['mediaFiles'] if block['data']['mediaFiles']
            end
          end

          result += [parsed_draft['thumbnail_id']] if parsed_draft['thumbnail_id']
        end
      end
    end

    result.uniq
  end

  def cleanup_media_files!
    # TODO: Reimplement the cleanup of media files.
    #media_files.where.not(id: essential_media_files).destroy_all
  end

  def migrate_content!
    return unless parsed_content.present?

    migrated_blocks = content_blocks.map do |block|
      puts "\e[0m-----"
      pp block
      case block['type']
      when 'action'
        {
          type: 'action',
          data: {
            id: block['data']['id'],
            action: block['data']['text'],
            url: Contentable.strip_url(block['data']['url']),
            type: 'button',
            decorations: block['data']['decorations'] || {},
          }
        }
      when 'catalog'
        {
          type: 'catalog',
          data: {
            id: block['data']['id'],
            items: block['data']['items'].map { |item| item['id'].to_i },
            type: block['data']['type'],
            style: block['data']['withImages'] ? 'image' : 'text',
            decorations: block['data']['decorations'] || {},
          }
        }
      when 'form'
        {
          type: 'action',
          data: {
            id: block['data']['id'],
            title: block['data']['title'],
            subtitle: block['data']['subtitle'],
            text: block['data']['text'],
            action: block['data']['action'],
            list_id: block['data']['list_id'],
            type: 'form',
            form: block['data']['format'],
            spacing: block['data']['compact'] ? 'compact' : 'spaced',
            decorations: block['data']['decorations'] || {},
          }
        }
      when 'header'
        {
          type: 'paragraph',
          data: {
            id: block['data']['id'],
            text: block['data']['text'],
            type: 'header',
            level: block['data']['level'],
            decorations: block['data']['centered'] ? { leaves: true } : {}
          }
        }
      when 'image'
        {
          type: 'media',
          data: {
            id: block['data']['id'],
            items: block['data']['items'],
            type: 'image',
            quantity: block['data']['asGallery'] ? 'gallery' : 'single',
            position: block['data']['position'] == 'wide' ? 'center' : block['data']['position'],
            size: block['data']['size'] == 'wide' || block['data']['position'] == 'wide' ? 'wide' : 'normal',
            mediaFiles: block['data']['media_files'],
            decorations: block['data']['decorations'] || {},
          }
        }
      when 'list'
        {
          type: 'list',
          data: {
            id: block['data']['id'],
            items: block['data']['items'],
            type: 'text',
            style: block['data']['style'],
          }
        }
      when 'paragraph'
        {
          type: 'paragraph',
          data: {
            id: block['data']['id'],
            text: block['data']['text'],
            type: 'text',
          }
        }
      when 'quote'
        {
          type: 'textbox',
          data: {
            id: block['data']['id'],
            text: block['data']['text'],
            title: block['data']['credit'],
            subtitle: block['data']['caption'],
            type: 'text',
            style: block['data']['asPoem'] ? 'poem' : 'quote',
            alignment: block['data']['position'] || 'center',
            decorations: block['data']['decorations'] || {},
          }
        }
      when 'structured'
        {
          type: 'layout',
          data: {
            id: block['data']['id'],
            items: block['data']['items'],
            type: block['data']['format'],
            mediaFiles: block['data']['media_files'],
          }
        }
      when 'splash'
        {
          type: 'textbox',
          data: {
            id: block['data']['id'],
            image: block['data']['image'],
            title: block['data']['title'],
            subtitle: block['data']['text'],
            action: block['data']['action'],
            url: Contentable.strip_url(block['data']['url']),
            type: 'splash',
            color: 'light',
            mediaFiles: block['data']['media_files'],
            decorations: block['data']['decorations'] || {},
          }
        }
      when 'textbox'
        if block['data']['asVideo']
          # Remove this block in migration
        else
          {
            type: 'textbox',
            data: {
              id: block['data']['id'],
              image: block['data']['image'],
              title: block['data']['title'],
              text: block['data']['text'],
              action: block['data']['action'],
              url: Contentable.strip_url(block['data']['url']),
              type: 'image',
              background: block['data']['asWisdom'] ? 'brown' : (block['data']['alignment'] == 'center' ? 'image' : 'white'),
              color: block['data']['invert'] ? 'light' : 'dark',
              position: block['data']['alignment'] == 'right' ? 'right' : 'left',
              spacing: block['data']['separate'] ? 'separate' : 'overlap',
              mediaFiles: block['data']['media_files'],
              decorations: block['data']['decorations'] || {},
            }
          }
        end
      when 'video'
        {
          type: 'vimeo',
          data: {
            id: block['data']['id'],
            items: block['data']['items'],
            quantity: block['data']['asGallery'] ? 'gallery' : 'single',
            legacy: true,
            decorations: block['data']['decorations'] || {},
          }
        }
      when 'whitespace'
        {
          type: 'whitespace',
          data: {
            id: block['data']['id'],
            size: block['data']['size'],
            decorations: block['data']['decorations'] || {},
          }
        }
      else
        puts "[WARN] Unsupported block type! #{block.type}"
      end
    end

    puts "Migrated content"
    content_blocks.each_with_index do |block, i|
      next unless %w[splash textbox whitespace action].include?(block['type'])

      puts "\e[32m#{block.pretty_inspect}\e[0m -> \e[36m#{migrated_blocks[i].pretty_inspect}"
      puts "\e[0m-----"
    end

    update!(content: parsed_content.merge("blocks" => migrated_blocks).to_json)
  end

  def self.strip_url url
    url # TODO: Remove wemeditate.co and assets.wemeditate.co
  end

end
