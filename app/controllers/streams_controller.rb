class StreamsController < ApplicationController

  def index
    @static_page = StaticPage.preload_for(:content).find_by(role: :streams)

    @countdown_time = countdown_target_time

    seconds_diff = (@countdown_time - Time.now).to_i
    @live = params[:live] || seconds_diff > 5.minutes

    if @live
      @stream_url = "https://player.twitch.tv/?channel=wemeditate&parent=#{request.host}"
    else
      @days = seconds_diff / 86400
      seconds_diff -= @days * 86400

      @hours = seconds_diff / 3600
      seconds_diff -= @hours * 3600

      @minutes = seconds_diff / 60
      seconds_diff -= @minutes * 60

      @seconds = seconds_diff
    end

    set_metadata(@static_page)
  end

  private

    def countdown_target_time
      countdown_time = next_stream_time(Date.today)
      countdown_time = next_stream_time(Date.tomorrow) if Time.now > countdown_time + 30.minutes
      countdown_time
    end

    def next_stream_time date
      if date < DateTime.parse('2020-03-27')
        date = DateTime.parse('2020-03-27')
      elsif date.saturday? || date.sunday?
        date = date.monday
      end

      date.to_time.change(hour: 15)
    end

end