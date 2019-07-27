## HAS CONTENT CONCERN
# This concern should be added to models have arbitrary body content

module HasContent

  extend ActiveSupport::Concern

  included do |base|
    base.has_many :media_files, as: :page, inverse_of: :page, dependent: :delete_all
    # base.validates :content, presence: true
  end

  def parsed_content
    self[:content].is_a?(Hash) || self[:content].nil? ? self[:content] : JSON.parse(self[:content])
  end

  def content_blocks
    if self[:content].nil?
      []
    else
      parsed_content['blocks']
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
      preserve_draft = (I18n.locale != locale)

      Globalize.with_locale(locale) do
        puts "CHECKING #{translation.pretty_inspect}"

        if content_blocks.present?
          content_blocks.each do |block|
            result += block['data']['media_files'] if block['data']['media_files']
          end
        end

        result += [thumbnail_id] if self.has_attribute?(:thumbnail_id)

        if preserve_draft && has_draft?
          if parsed_draft_content.present?
            parsed_draft_content['blocks'].each do |block|
              result += block['data']['media_files']
            end
          end

          result += [local_draft['thumbnail_id']] if local_draft['thumbnail_id']
        end
      end
    end

    # TODO: Remove test code
    puts "ESSENTIAL FILES #{locale}: #{result}"
    result
  end

  def cleanup_media_files!
    # TODO: Fix this
    # When you edit a page content, and then press Save & Approve it will destroy any media files which are new and haven't been persisted yet.
    # media_files.where.not(id: essential_media_files).destroy_all
  end

end
