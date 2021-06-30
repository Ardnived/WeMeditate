## DRAFTABLE CONCERN
# This concern should be added to models that require an admin to approve any change to the record.

module Draftable

  extend ActiveSupport::Concern

  def draftable?
    true
  end

  included do |base|
    translatable = base.respond_to?(:translated_attribute_names)

    %i[draft].each do |column|
      next if base.try(:translated_attribute_names)&.include?(column) || base.column_names.include?(column.to_s)
      throw "Column `#{column}` must be defined to make the `#{base.model_name}` model `Draftable`"
    rescue ActiveRecord::NoDatabaseError, ActiveRecord::StatementInvalid # rubocop:disable Lint/HandleExceptions
      # avoid breaking rails db:create / db:drop etc due to boot time execution
    end

    if translatable
      base.scope :has_draft, -> { with_translation.where.not(base::Translation.table_name => { draft: nil }) }
      base.scope :has_no_draft, -> { with_translation.where(base::Translation.table_name => { draft: nil }) }
    else
      base.scope :has_draft, -> { where.not(draft: nil) }
      base.scope :has_no_draft, -> { where(draft: nil) }
    end

    base.scope :needs_review, -> { has_draft }

    def self.draftable?
      true
    end
  end

  def needs_review?
    has_draft?
  end

  def has_draft? section = nil
    return false unless parsed_draft.present?

    if section == :content
      parsed_draft.has_key?('content')
    elsif section == :details
      parsed_draft.except('content', 'contributors').present?
    else
      true
    end
  end

  def ready_for_review? section = nil
    return false unless has_draft?(section)

    if stateable?
      state == :published || parsed_draft['state'] == 'published'
    elsif publishable?
      published
    else
      true
    end
  end

  def parsed_draft
    @parsed_draft ||= draft
  end

  def parsed_draft_content
    @parsed_draft_content ||= begin
      return nil unless parsed_draft['content'].present?
      return parsed_draft['content'] if parsed_draft['content'].is_a?(Hash)
      JSON.parse(parsed_draft['content'])
    end
  end

  def draft_content_blocks
    parsed_draft_content ? parsed_draft_content['blocks'] : []
  end

  def record_draft! user, only: []
    new_draft = {}
    new_draft['contributors'] = has_draft? ? parsed_draft['contributors'] : []
    new_draft['contributors'] = new_draft['contributors'].to_set.add(user.id).to_a

    changes.each do |key, (old_value, new_value)|
      next if only.present? && !only.include?(key.to_sym)

      # Work around for the fact that globalize for some reason nilifies the values in the changes hash
      if try(:translated_attributes)&.key?(key)
        old_value = translation[key]
        new_value = self[key]
      end

      if old_value.to_s == new_value.to_s || (key == 'content' && content_equal?(old_value, new_value))
        new_draft.except!(key)
      else
        self[key] = old_value
        new_draft[key] = new_value
      end
    end

    self[:draft] = (parsed_draft || {}).merge(new_draft)
  end

  def reify_draft! only: nil
    return unless parsed_draft.present?

    parsed_draft.each do |key, value|
      next if key == 'contributors'
      self[key] = value if only.nil? || only.include?(key)
    end
  end

  def discard_draft! discard: [], keep: []
    if keep.present?
      self.draft.select! { |key| keep.include?(key.to_sym) }
    elsif discard.present?
      self.draft.reject! { |key| discard.include?(key.to_sym) }
    else
      self.draft = nil
    end

    self.draft = nil unless draft&.except('contributors').present?
  end

  def cleanup_draft!
    draft = parsed_draft
    discardable_attributes = []

    changes.each do |key, (old_value, new_value)|
      next unless draft&.has_key?(key)

      if key == 'content'
        # Compare content using the blocks only.
        new_value = JSON.parse(new_value)['blocks'] if new_value
        draft_value = parsed_draft_content['blocks'] if parsed_draft_content
      else
        draft_value = draft[key]
      end

      discardable_attributes << key.to_sym if new_value.to_s == draft_value.to_s
    end

    discard_draft! discard: discardable_attributes
  end

  def approve_content_changes! changes
    live_blocks = content_blocks.map { |b| [b['data']['id'], b] }.to_h
    draft_blocks = parsed_draft_content['blocks'].map { |b| [b['data']['id'], b] }.to_h
    new_draft_content = parsed_draft_content.merge('blocks' => [], 'media_files' => [])
    new_live_content = new_draft_content.deep_dup

    changes.each do |change|
      id = change['id']

      case change['effect']
      when 'added', 'modified'
        append_block! draft_blocks[id], to: new_live_content
        append_block! draft_blocks[id], to: new_draft_content
      when 'nochange'
        append_block! live_blocks[id], to: new_live_content
        append_block! draft_blocks[id], to: new_draft_content
      when 'removed'
        # Do nothing
      end
    end

    if !content_equal?(new_live_content, new_draft_content)
      write_attribute :draft, parsed_draft.merge(content: new_draft_content)
    else
      discard_draft! discard: %i[content]
    end

    write_attribute :content, new_live_content
    #binding.pry
  end

  private

    def append_block! block, to: nil
      if block.present? && to.present?
        to['blocks'] << block
        to['mediaFiles'] << block['data']['mediaFiles'] if block['data']['mediaFiles'].present?
      end
    end

    def content_equal? old_content, new_content
      old_content = JSON.parse(old_content)['blocks'] unless old_content.nil? || old_content.is_a?(Hash)
      new_content = JSON.parse(new_content)['blocks'] unless new_content.nil? || new_content.is_a?(Hash)
      old_content == new_content
    end

end
