module Admin
  class ApplicationRecordController < Admin::ApplicationController

    before_action :set_record, only: %i[show edit write update destroy preview review approve audit]
    before_action :authorize!, except: %i[create]

    def index
      localize :content do
        @records = policy_scope(@model).order(updated_at: :desc).q(params[:q])
        @records = sort_by(@records, params[:sort])
        @records = filter_by(@records, params[:filter])
        @records = @records.where(id: params[:ids].split(',').map(&:to_i)) unless params[:ids].blank?
        @records = @records.where.not(id: params[:exclude].split(',').map(&:to_i)) unless params[:exclude].blank?

        respond_to do |format|
          format.html do
            @records = @records.page(params[:page]).per(15)
            render 'admin/application/index'
          end

          format.js do
            @records = @records.page(params[:page]).per(15)
            render 'admin/application/index'
          end

          format.json do
            records_json = @records.limit(5).map do |record|
              {
                id: record.id,
                name: record.name,
                excerpt: record.try(:excerpt),
                preview: record.try(:thumbnail)&.small&.url,
              }
            end

            render json: records_json
          end
        end
      end
    end

    def show
      localize :content do
        render 'admin/application/show'
      end
    end

    def new
      localize :content do
        @record = @model.new
        render 'admin/application/new'
      end
    end

    def edit
      localize :content do
        render 'admin/application/edit'
      end
    end

    def write
      localize :content do
        render 'admin/application/write'
      end
    end

    def create record_params, redirect = nil
      localize :content do
        record_params[:locale] = Globalize.locale if @model.column_names.include?('locale')
        @record = @model.new update_params(record_params)
        authorize @record

        save!(:create, nil, redirect) do
          after_create
        end
      end
    end

    def update record_params, redirect = nil
      localize :content do
        save!(:update, update_params(record_params), redirect) do
          @record.try(:cleanup_media_files!)
        end
      end
    end

    def review
      localize :content do
        render 'admin/application/review', layout: 'admin/review'
      end
    end

    def preview
      localize :interface do
        reify = reify == '' ? [] : params[:reify]&.split(',')
        @record.try(:reify_draft!, only: reify) unless params[:review] && !params[:excerpt]
        render 'admin/application/preview', layout: params[:excerpt] ? 'basic' : 'application'
      end
    end

    def approve
      localize :content do
        redirect = helpers.polymorphic_admin_path([:admin, (@record.contentable? ? @record : @model)])
        if params[:review] == 'destroy'
          @record.discard_draft!
        else
          review = JSON.parse(params[:review])
          @record.reify_draft! only: review['details'] if @record.has_draft?(:details)
          @record.approve_content_changes! review['content'] if @record.has_draft?(:content)
        end

        if @record.save!
          @record.cleanup_draft!
          @record.save!
          @record.try(:cleanup_media_files!)
          redirect_to redirect, flash: { notice: translate('admin.result.updated') }
        else
          render 'admin/application/review', layout: 'application'
        end
      end
    end

    def destroy associations: []
      localize :content do
        associations.each do |key|
          if @record.send(key).present?
            associated_model = @model.reflect_on_association(key).class
            message = translate('admin.result.cannot_delete_attached_record', category: human_model_name(@model).downcase, pages: human_model_name(associated_model, :plural).downcase)
            redirect_to helpers.polymorphic_admin_path([:admin, @model]), alert: message
          end  
        end

        if @record.translatable? && @record.has_translation?
          if @record.translated_locales.count == 1
            @record.destroy
          else
            @record.translations.where(locale: Globalize.locale).destroy_all
          end
        else
          @record.destroy
        end

        respond_to do |format|
          format.html { redirect_to helpers.polymorphic_admin_path([:admin, @model]), flash: { notice: translate('admin.result.deleted') } }
          format.js { render 'admin/application/destroy' }
        end
      end
    end

    def audit
      localize :content do
        @audits = @record.audits.with_associations
        render 'admin/special/audit'
      end
    end

    def sort
      localize :content do
        params[:order].each_with_index do |id, index|
          @model.find(id).update_attribute(:order, index)
        end

        redirect_to helpers.polymorphic_admin_path([:admin, @model])
      end
    end

    protected

      def save! action, record_params, redirect = nil, &block
        allow = policy(@record)
        @record.attributes = record_params if record_params.present?
  
        will_publish = allow.publish? && (!@record.draftable? || params[:draft] != 'true')
        will_validate = (will_publish || action == :create)
        notice = translate (action == :create ? 'created' : 'updated'), scope: %i[admin result]

        if redirect.nil?
          if allow.show?
            redirect = helpers.polymorphic_admin_path([:admin, @record])
          elsif allow.index?
            redirect = helpers.polymorphic_admin_path([:admin, @model])
          else
            redirect = helpers.polymorphic_admin_path([:edit, :admin, @record])
          end
        end
  
        if @record.draftable?
          if will_publish
            @record.cleanup_draft!
          elsif action == :create
            @record.record_draft!(current_user, only: %i[published])
            notice = translate('admin.result.saved_but_needs_review')
          else
            @record.record_draft!(current_user)
            notice = translate('admin.result.saved_but_needs_review')
          end
        end

        if @record.save(validate: will_validate) && block.call != false
          flash.notice = notice
          redirect_to redirect
        else
          render action == :create ? :new : :edit
        end
      end

      def update_params record_params
        if record_params[:metatags].present?
          record_params[:metatags] = record_params[:metatags][:keys].zip(record_params[:metatags][:values]).to_h
        elsif @record.respond_to?(:metatags) && !record_params[:content].present?
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
        localize :content do
          @record = @model.preload_for(:admin).find(params[:id])
          instance_variable_set("@#{@record.model_name.param_key}", @record)
        end
      end

      def authorize!
        authorize @record || @model
      end

      def sort_by relation, param
        return relation unless param.present?
        
        direction = param.ends_with?('_at') ? :desc : :asc
        relation = relation.with_translation if relation.translatable?
        relation.reorder(param => direction)
      end
  
      def filter_by relation, param
        return relation unless param.present?

        param = param.split(':')
        column = param[0]
        value = param[1]

        if column == 'status'
          args = value == 'needs_translation' ? [current_user] : []
          relation.respond_to?(value) ? relation.send(value, *args) : relation
        elsif column == 'priority'
          # TODO: Remove this temporary hard coding in favour of a more generic solution.
          relation.where(column => @model.priorities[value])
        else
          relation.where(column => value)
        end
      end

  end
end
