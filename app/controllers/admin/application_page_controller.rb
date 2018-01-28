module Admin
  class ApplicationPageController < Admin::ApplicationController
    before_action :set_page, except: [:index, :create, :new]
    before_action :authorize!, except: [:create]

    def index
      pages_name = @klass.name.pluralize.underscore
      instance_variable_set('@'+pages_name, @klass.all)
    end

    def show
      redirect_to [:edit, :admin, @page]
    end

    def new
      page_name = @klass.name.underscore
      instance_variable_set('@'+page_name, @klass.new)
    end

    def edit
    end

    def create page_params
      @page = @klass.new page_params
      set_instance_variable
      authorize @page

      if @page.save
        redirect_to [:admin, @klass]
      else
        render :new
      end
    end

    def update page_params
      # TODO: Fix slug resetting
      if params[:reset_slug]
        page_params.merge slug: nil
      end

      if page_params[:sections_attributes].present?
        page_params[:sections_attributes].each do |_, section|
          section[:format] = section[:format][section[:content_type]]
        end
      end

      print params
      print "\r\n"
      print page_params
      print "\r\n\r\n"

      if @page.update page_params
        redirect_to [:edit, :admin, @page]
        #redirect_to [:admin, @klass]
      else
        render :edit
      end
    end

    def destroy
      if @page.translated_locales.include? I18n.locale
        if @page.translated_locales.count == 1
          @page.destroy
        else
          @page.translations.find_by(locale: I18n.locale).delete
          @page.sections.where(language: I18n.locale).delete_all
        end
      end

      redirect_to [:admin, @klass]
    end

    protected
      ALLOWED_SECTION_ATTRIBUTES = [
        :id, :order, :_destroy, # Meta fields
        :header, :content_type, :visibility_type, :visibility_countries,
        :title, :subtitle, :text, :quote, :credit, :image, :action_text, :url, # These are the options for different content_types
        { format: [ :text, :image, :action ], images: [] }, # For image uploads
      ]

      def set_model klass
        @klass = klass
      end

    private
      def set_page
        @page = @klass.friendly.find(params[:id])
        set_instance_variable
      end

      def set_instance_variable
        page_name = @klass.name.underscore
        instance_variable_set('@'+page_name, @page)
      end

      def authorize!
        authorize @page || @klass
      end

  end
end
