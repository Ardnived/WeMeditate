module Admin
  # Basic controller that all other admin controllers inherit from.
  class ApplicationController < ::ApplicationController

    before_action :authenticate_user!
    after_action :verify_authorized, except: %i[dashboard vimeo_data]

    def dashboard
      @issues = []

      StaticPage.untranslated.each do |static_page|
        @issues << {
          name: helpers.human_enum_name(static_page, :role),
          url: url_for([:edit, :admin, static_page]),
          message: translate('admin.tags.no_translation'),
          urgency: :critical,
        }
      end

      SubtleSystemNode.untranslated.each do |subtle_system_node|
        @issues << {
          name: helpers.human_enum_name(subtle_system_node, :role),
          url: url_for([:edit, :admin, subtle_system_node]),
          message: translate('admin.tags.no_translation'),
          urgency: :critical,
        }
      end

      Article.where.not(draft: nil).each do |article|
        @issues << {
          name: article.name,
          url: url_for([:edit, :admin, article]),
          message: translate('admin.tags.unpublished_changes'),
          urgency: :important,
        }
      end

      Article.untranslated.each do |article|
        @issues << {
          name: article.name,
          url: url_for([:edit, :admin, article]),
          message: translate('admin.tags.no_translation'),
          urgency: :normal,
        }
      end
    end
    
    def vimeo_data
      render json: retrieve_vimeo_data(params[:vimeo_id])
    end

    private

      def retrieve_vimeo_data vimeo_id
        Integer(vimeo_id) rescue raise ArgumentError, "Vimeo ID is not valid: \"#{vimeo_id}\""
        raise 'Vimeo Access Key has not been set' unless ENV['VIMEO_ACCESS_KEY'].present?

        uri = URI("https://api.vimeo.com/videos/#{vimeo_id}?fields=name,pictures.sizes")
        request = Net::HTTP::Get.new(uri)
        request['Authorization'] = "Bearer #{ENV['VIMEO_ACCESS_KEY']}"
      
        response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
          http.request(request)
        end
      
        response = JSON.parse(response.body)
      
        return {
          vimeo_id: vimeo_id,
          title: response['name'],
          thumbnail: response['pictures']['sizes'].last['link'],
          thumbnail_srcset: response['pictures']['sizes'].map { |pic| "#{pic['link']} #{pic['width']}w" }.join(','),
        }
      end

  end
end
