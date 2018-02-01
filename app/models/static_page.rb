class StaticPage < ApplicationRecord
  extend FriendlyId

  # Drafts
  has_paper_trail ignore: [:published_at]
  include RequireApproval

  # Extensions
  translates :title, :slug
  friendly_id :title, use: :globalize

  # Associations
  enum role: [ :home, :contact, :shri_mataji, :chakra_1, :chakra_2 ]
  has_many :sections, -> { order(:order) }, as: :page, dependent: :delete_all

  # Validations
  validates :title, presence: true
  accepts_nested_attributes_for :sections, reject_if: :all_blank, allow_destroy: true

  # Scopes
  default_scope { order(:role) }
  scope :untranslated, -> { joins(:translations).where.not(static_page_translations: { locale: I18n.locale }) }

  def self.available_roles
    StaticPage.roles.keys - StaticPage.pluck(:role)
  end

  def cache_key
    super + '-' + Globalize.locale.to_s
  end

end
  