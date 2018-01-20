module Admin
    class CategoriesController < Admin::ApplicationController
      before_action :set_category, except: [:index, :create, :sort]

      def index
        @categories = Category.order(:order).all
      end

      def create
        @category = Category.new category_params
        @category.save
        redirect_to [:admin, Category]
      end

      def update
        atts = category_params

        if params[:category][:reset_slug]
          atts[:slug] = nil
        end

        if @category.update atts
          redirect_to [:admin, Category]
        else
          format.json { render json: @category.errors, status: :unprocessable_entity }
        end
      end

      def sort
        params[:order].each_with_index do |id, index|
          Category.find(id).update_attribute(:order, index)
        end

        redirect_to [:admin, Category]
      end

      def destroy
        @category.destroy #if @category.documents.count == 0
        redirect_to [:admin, Category]
      end

      private
        def category_params
          params.fetch(:category, {}).permit(:name)
        end

        def set_category
          @category = Category.friendly.find(params[:id])
        end
  
    end
  end
  