class ApplicationRecord < ActiveRecord::Base

  self.abstract_class = true

  def self.preload_for _mode
    self # Subclasses override this to provide real preloading behaviour
  end

  def reviewable?
    respond_to?(:draft)
  end

  def has_content?
    respond_to?(:content)
  end

  def viewable?
    respond_to?(:slug) and respond_to?(:metatags)
  end

  def translatable?
    respond_to?(:translated_locales)
  end

end
