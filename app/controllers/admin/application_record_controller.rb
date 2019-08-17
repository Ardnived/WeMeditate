module Admin
  class ApplicationRecordController < Admin::ApplicationController

    before_action :set_record, only: %i[show edit write update destroy preview review approve]
    before_action :authorize!, except: %i[create]

    def index
      @records = policy_scope(@model).q(params[:q])

      respond_to do |format|
        format.html do
          @records = @records.page(params[:page])
          render 'admin/application/index'
        end

        format.json do
          render json: @records.limit(5).to_json(only: %i[id name])
        end
      end
    end

    def show
      render 'admin/application/show'
    end

    def new
      @record = @model.new
      render 'admin/application/new'
    end

    def edit
      render 'admin/application/edit'
    end

    def write
      render 'admin/application/write'
    end

    def create record_params, redirect = nil
      @record = @model.new update_params(record_params)
      @record.published_at ||= Time.now.to_date if @record.published? && @record.respond_to?(:published_at)
      authorize @record

      if @record.save && after_create
        redirect_to helpers.polymorphic_admin_path(redirect || [:edit, :admin, @record]), flash: { notice: translate('admin.result.created') }
      else
        render :new
      end
    end

    def update record_params, redirect = nil
      allow = policy(@record)
      record_params = update_params(record_params)
      @record.attributes = record_params

      will_publish = allow.publish? && (!@record.reviewable? || params[:draft] != 'true')
      notice = translate 'admin.result.updated'
      action = (@record.has_content? && record_params[:content].present? ? :write : :edit)
      # redirect = helpers.polymorphic_admin_path([action, :admin, @record]) if redirect.nil?
      redirect = helpers.polymorphic_admin_path(allow.show? ? [:admin, @record] : [:admin, @model]) if redirect.nil?

      @record.published_at ||= Time.now.to_date if will_publish && @record.respond_to?(:published_at)

      if @record.reviewable? 
        if will_publish
          @record.cleanup_draft!
        else
          @record.record_draft!(current_user)
          notice = translate('admin.result.saved_but_needs_review')
        end
      end

      if @record.save(validate: will_publish)
        @record.try(:cleanup_media_files!) if will_publish
        redirect_to redirect, flash: { notice: notice }
      else
        render :edit
      end
    end

    def review
      render 'admin/application/review', layout: 'application'
    end

    def preview
      @record.reify_draft!
      render 'admin/application/preview', layout: 'application'
    end

    def approve
      redirect = helpers.polymorphic_admin_path([:admin, (@record.has_content? ? @record : @model)])
      if params[:review] == 'destroy'
        @record.discard_draft! discard: %i[content]
      else
        @record.approve_content_changes! JSON.parse(params[:review])
      end

      if @record.save
        @record.try(:cleanup_media_files!)
        redirect_to redirect, flash: { notice: translate('admin.result.updated') }
      else
        render :review
      end
    end

    def destroy associations: []
      associations.each do |key|
        if @record.send(key).present?
          associated_model = @model.reflect_on_association(key).class
          message = translate('admin.result.cannot_delete_attached_record', category: @model.model_name.human.downcase, pages: associated_model.model_name.human(count: -1).downcase)
          redirect_to helpers.polymorphic_admin_path([:admin, @model]), alert: message
        end  
      end

      if @record.translatable? && @record.translated_locales.include?(I18n.locale)
        if @record.translated_locales.count == 1
          @record.destroy
        else
          @record.translations.where(locale: I18n.locale).destroy_all
        end
      else
        @record.destroy
      end

      respond_to do |format|
        format.html { redirect_to helpers.polymorphic_admin_path([:admin, @model]), flash: { notice: translate('admin.result.deleted') } }
        format.js { render 'admin/application/destroy' }
      end
    end

    def sort
      params[:order].each_with_index do |id, index|
        @model.find(id).update_attribute(:order, index)
      end

      redirect_to helpers.polymorphic_admin_path([:admin, @model])
    end

    protected

      def update_params record_params
        if record_params[:metatags].present?
          record_params[:metatags] = record_params[:metatags][:keys].zip(record_params[:metatags][:values]).to_h
        elsif @record.respond_to?(:metatags)
          record_params[:metatags] = nil
        end

        record_params[:published] = record_params[:published].to_i.positive? if record_params[:published].present?
        record_params
      end

      def after_create
        true # Return success, since we didn't need to do anything
      end

    private

      def set_record
        @record = @model.preload_for(:admin).find(params[:id])
        instance_variable_set("@#{@record.model_name.param_key}", @record)
      end

      def authorize!
        authorize @record || @model
      end

  end
end
