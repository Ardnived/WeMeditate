class CategoriesController < ApplicationController

  ARTICLES_PER_PAGE = 10

  def index
    @category = nil
    @articles = Article.preload_for(:preview).offset(params[:offset]).limit(ARTICLES_PER_PAGE)
    display
  end

  def show
    @category = Category.friendly.find(params[:id])
    @articles = @category.articles.preload_for(:preview).offset(params[:offset]).limit(ARTICLES_PER_PAGE)
    display
  end

  protected

    def display
      next_offset = params[:offset].to_i + ARTICLES_PER_PAGE

      if @articles.count < next_offset
        @loadmore_url = nil
      elsif @category.nil?
        @loadmore_url = categories_path(format: 'js', offset: next_offset)
      else
        @loadmore_url = category_path(@category, format: 'js', offset: next_offset)
      end

      respond_to do |format|
        format.html do
          @static_page = StaticPage.preload_for(:content).find_by(role: :articles)
          @record = @static_page
          @categories = Category.includes(:translations).all # TODO: Use '.joins(:articles).uniq' to only get categories that have articles in them

          @breadcrumbs = [
            { name: StaticPageHelper.preview_for(:home).name, url: root_path },
            { name: @static_page.name },
          ]
          render :show
        end

        format.js do
          render :show
        end
      end
    end

end
