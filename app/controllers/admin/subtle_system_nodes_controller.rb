module Admin
  class SubtleSystemNodesController < Admin::ApplicationRecordController

    prepend_before_action { @model = SubtleSystemNode }

    def new
      @record = SubtleSystemNode.new role: params[:role]
      @record.generate_default_sections!
      render 'admin/application/new'
    end

    def edit
      @record.generate_required_sections!
      super
    end

    def create
      super subtle_system_node_params
    end

    def update
      super subtle_system_node_params
    end

    protected

      def subtle_system_node_params
        if policy(@record || SubtleSystemNode).update_structure?
          params.fetch(:subtle_system_node, {}).permit(:name, :slug, :excerpt, :role, :content, metatags: {})
        else
          params.fetch(:subtle_system_node, {}).permit(:name, :excerpt)
        end
      end

  end
end
