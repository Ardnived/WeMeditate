## MOOD FILTER
# A mood refers to the feeling given by a particular music track, so that users can filter by what they want to hear.

# TYPE: FILTER
# A mood is considered to be a "Filter", which is used to categorize the Track model

class Stream < ApplicationRecord

  # Extensions
  extend ArrayEnum
  audited

  # Concerns
  include Viewable
  include Contentable
  include Draftable
  include Stateable

  # Associations
  has_many :media_files, as: :page, inverse_of: :page, dependent: :delete_all
  array_enum recurrence: { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 }, array: true

  # Validations
  validates_presence_of :name, :slug, :excerpt, :stream_url
  validates_presence_of :location, :time_zone, :target_time_zones
  validates_presence_of :recurrence, :start_date, :start_time, :end_time
  validates :thumbnail_id, presence: true, if: :persisted?
  validates :duration, numericality: { greater_than: 0 }

  # Scopes
  scope :q, -> (q) { where('name ILIKE ?', "%#{q}%") if q.present? }

  # Include everything necessary to render this model
  def self.preload_for mode
    includes(:media_files)
  end

  def self.for_time_zone time_zone
    offset = time_zone.utc_offset / 1.hour
    streams = publicly_visible.select('streams.*', "#{offset} = ANY(target_time_zones) AS featured", "ABS(streams.time_zone - #{offset}) AS distance")
    streams.order(featured: :desc, distance: :asc).first
  end

  # Shorthand for the stream thumbnail image file
  def thumbnail
    media_files.find_by(id: thumbnail_id)&.file
  end

  def time_zone_data
    ActiveSupport::TimeZone[self[:time_zone]] rescue nil
  end

  def time_zone_offset
    return nil if time_zone_data.nil?

    time_zone_data.utc_offset / 1.hour
  end

  def live?
    seconds_until_next_stream_time < 5.minutes
  end

  def duration
    Time.parse(end_time) - Time.parse(start_time)
  end

  def seconds_until_next_stream_time
    next_stream_time - Time.zone.now
  end

  def next_stream_time
    current_time = Time.zone.now
    current_date = current_time.to_date
    countdown_time = next_stream_time_for(current_date)
    countdown_time = next_stream_time_for(current_date + 1.day) if current_time > countdown_time + duration
    countdown_time
  end

  def next_stream_time_for date
    weekday = Stream.recurrences.key(date.wday)
    if recurrence.include? weekday
      time = start_time.split(':')
      date.to_time.change(hour: time[0].to_i, min: time[1].to_i)
    else
      next_stream_time_for(date + 1.day)
    end
  end

  def valid_end_time?
    Time.parse(end_time) > Time.parse(start_time)
  end

end