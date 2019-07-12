module Admin
  class InstrumentFiltersController < Admin::ApplicationRecordController

    prepend_before_action { @model = InstrumentFilter }

    def create
      super instrument_filter_params
    end

    def update
      super instrument_filter_params
    end

    def destroy
      if @instrument_filter.tracks.present?
        message = t('messages.result.cannot_delete_attached_record', model: InstrumentFilter.model_name.human.downcase, association: Track.model_name.human(count: -1).downcase)
        redirect_to [:admin, InstrumentFilter], alert: message
      else
        super
      end
    end

    private

      def instrument_filter_params
        if policy(@instrument_filter || InstrumentFilter).publish?
          params.fetch(:instrument_filter, {}).permit(:name, :icon, :published)
        else
          params.fetch(:instrument_filter, {}).permit(:name, :icon)
        end
      end

  end
end
