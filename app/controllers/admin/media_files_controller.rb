module Admin
  class MediaFilesController < Admin::ApplicationController

    include ActionController::Live

    def create
      if params[:article_id].present?
        @parent = Article.friendly.find(params[:article_id])
      elsif params[:treatment_id].present?
        @parent = Treatment.friendly.find(params[:treatment_id])
      elsif params[:static_page_id].present?
        @parent = StaticPage.friendly.find(params[:static_page_id])
      elsif params[:subtle_system_node_id].present?
        @parent = SubtleSystemNode.friendly.find(params[:subtle_system_node_id])
      elsif params[:stream_id].present?
        @parent = Stream.where(locale: Globalize.locale).friendly.find(params[:stream_id])
      end

      authorize @parent, :upload?
      @media_file = @parent.media_files.build params.permit(:file)

      return render json: { errors: @media_file.errors.full_messages }, status: 422 unless @media_file.validate

      # Bypass Heroku's 30s request timeout by treating it as a streaming response:
      # https://devcenter.heroku.com/articles/request-timeout#long-polling-and-streaming-responses
      headers['Content-Type'] = 'application/json'
      # Prevent Rack::ETag from killing the streaming response: https://git.io/Jk5i0
      headers['Last-Modified'] = '0'
      response_keep_alive_thread = Thread.new do
        loop do
          sleep 1
          response.stream.write "\n"
        rescue IOError => e
          Rails.logger.warn "IOError while writing to streaming response in MediaFilesController#create: #{e.message}"
          break
        end
      end

      # Transcodes multiple versions of the uploaded image which gets time consuming for large images
      @media_file.save!

      response_keep_alive_thread.kill

      response_json = { id: @media_file.id, preview: @media_file.file.small.url }.to_json
      response.stream.write(response_json)
    ensure
      response.stream.close
    end
  end
end
