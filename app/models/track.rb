class Track < ApplicationRecord

  # Extensions
  translates :title

  # Associations
  has_and_belongs_to_many :mood_filters
  has_and_belongs_to_many :instrument_filters
  belongs_to :artist, optional: true
  mount_uploader :audio, TrackUploader

  alias name title
  
end
