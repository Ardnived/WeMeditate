module Admin
    class StaticPagesController < Admin::ApplicationPageController
      prepend_before_action do
        set_model StaticPage
      end
  
      def create
        super static_page_params
      end
  
      def update
        super static_page_params
      end
  
      protected
        def static_page_params
          if policy(@static_page || StaticPage).update_structure?
            params.fetch(:article, {}).permit(
              :title, :slug, :role,
              sections_attributes: Admin::ApplicationPageController::ALL_SECTION_ATTRIBUTES
            )
          else
            params.fetch(:article, {}).permit(
              :title,
              sections_attributes: Admin::ApplicationPageController::TRANSLATABLE_SECTION_ATTRIBUTES
            )
          end
        end
  
    end
  end
  