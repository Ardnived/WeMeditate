## CATEGORY
# Articles are placed into different categories which are defined by this model.

# TYPE: FILTER
# An category is considered to be a "Filter", which is used to categorize the Article model

class Category < ApplicationRecord

  extend FriendlyId

  # Extensions
  translates :name, :slug, :published
  friendly_id :name, use: :globalize

  # Associations
  has_many :articles

  # Validations
  validates :name, presence: true, uniqueness: true

  # Scopes
  default_scope { order(:order) }
  scope :untranslated, -> { joins(:translations).where.not(category_translations: { locale: I18n.locale }) }
  scope :published, -> { joins(:translations).where(published: true, category_translations: { locale: I18n.locale }) }
  scope :q, -> (q) { joins(:translations).where('category_translations.name ILIKE ?', "%#{q}%") if q.present? }

  def self.has_content
    joins(articles: :translations).where({
      article_translations: { published: true, locale: I18n.locale },
    }).uniq
  end

  def preload_for mode
    case mode
    when :preview, :content, :admin
      includes(:translations)
    end
  end

end
