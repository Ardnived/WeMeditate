class MoodFilter < ApplicationRecord

  # Extensions
  translates :name

  # Associations
  has_and_belongs_to_many :tracks
  mount_uploader :icon, IconUploader

  # Validations
  validates :name, presence: true
  validates :icon, presence: true

  # Scopes
  default_scope { order( :order ) }
  scope :untranslated, -> { joins(:translations).where.not(mood_filter_translations: { locale: I18n.locale }) }

end
