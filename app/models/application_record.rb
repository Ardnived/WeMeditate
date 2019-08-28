class ApplicationRecord < ActiveRecord::Base

  MAX_INT = 2147483647

  before_validation :set_original_locale

  self.abstract_class = true

  def self.preload_for _mode
    self # Subclasses override this to provide real preloading behaviour
  end

  def publishable?
    respond_to?(:published)
  end

  def published?
    has_attribute?(:published) ? published : true
  end

  def viewable?
    respond_to?(:slug)
  end

  def has_content?
    false
  end

  def draftable?
    false
  end

  def translatable?
    false
  end
  
  def preview_name
    name = self[:name]
    name ||= parsed_draft['name'] if try(:parsed_draft).present?
    name ||= get_localized_attribute(:name, original_locale) if translatable?
    name ||= I18n.translate('admin.misc.no_translated_title')
  end

  def cache_key
    super + '-' + Globalize.locale.to_s
  end

end

class VimeoValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    unless value =~ /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i
      record.errors[attribute] << (options[:message] || "is not a vimeo id")
    end
  end
end
