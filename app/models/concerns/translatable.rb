## DRAFTABLE CONCERN
# This concern should be added to models that require an admin to approve any update,
# before it is reflected in the public-facing website.

module Translatable

  extend ActiveSupport::Concern

  def translatable?
    true
  end

  included do |base|
    throw "Translations must be defined to make the `#{base.model_name}` model `Translatable`" unless base.respond_to?(:translated_attribute_names)

    base.scope :foreign_locale, -> { where.not(original_locale: I18n.locale) }
    base.scope :with_translation, -> { with_translations(I18n.locale) }
    base.scope :without_translation, -> { where.not(id: with_translation) }
    base.scope :without_complete_translation, -> { where.not(id: with_translation).or(base.where(id: with_incomplete_translation)) }

    if base.stateable?
      base.scope :with_incomplete_translation, -> { with_translation.where(state: nil).or(base.with_translation.where(state: base.states[:in_progress])) }
    else
      base.scope :with_incomplete_translation, -> { with_translation.where(published_at: nil) }
    end

    # User scopes
    base.scope :localizeable_by, -> (user) { where(original_locale: user.available_languages) }
    base.scope :translatable_by, -> (user) { without_complete_translation.localizeable_by(user) }
    base.scope :needs_translation_by, -> (user) { without_translation.localizeable_by(user) }

    base.before_validation :set_original_locale

    def self.translatable?
      true
    end
  end

  def translatable_by? user
    !has_complete_translation? && user.available_languages.include?(original_locale.to_sym)
  end

  def needs_translation_by? user
    !has_translation? && user.available_languages.include?(original_locale.to_sym)
  end

  def has_complete_translation? locale: I18n.locale
    return false unless translated_locales.include?(locale)
    return false if stateable? && (state == nil || state == :in_progress)
    return false if !stateable? && published_at == nil
    return true
  end

  def has_incomplete_translation? locale: I18n.locale
    return false unless translated_locales.include?(locale)
    return true if stateable? && (state == nil || state == :in_progress)
    return true if !stateable? && published_at == nil
    return false
  end

  def has_translation? section = nil, locale: I18n.locale, check_draft: true
    return false unless translated_locales.include?(locale)

    if section == :content
      return true if content.present?
    elsif section == :details
      return true if try(:name).present?
    else
      return true
    end

    return true if check_draft && has_draft?(section)
    false
  end

  def original_localization
    @original_localization ||= translation_for(original_locale)
  end

  # Retrieves the localized attribute without any fallback
  def get_native_locale_attribute attribute, locale = I18n.locale
    return self.send(attribute) unless translatable?

    if globalize.stash.contains?(locale, attribute)
      globalize.stash.read(locale, attribute)
    else
      translation_for(locale).send(attribute)
    end
  end

  private

    def set_original_locale
      self.original_locale = I18n.locale.to_s if has_attribute?(:original_locale) && original_locale.nil?
    end

end
