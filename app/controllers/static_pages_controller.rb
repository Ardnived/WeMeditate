class StaticPagesController < ApplicationController

  def show
    @static_page = StaticPage.publicly_visible.preload_for(:content).friendly.find(params[:id])
    return redirect_to helpers.static_page_path_for(@static_page) unless helpers.static_page_path_for(@static_page) == request.path
    return unless stale?(@static_page)

    case @static_page.role
    when 'about'
      @breadcrumbs = [
        { name: StaticPageHelper.preview_for(:home).name, url: root_path },
        { name: @static_page.name },
      ]
    when 'classes'
      # Do nothing, the classes page has no breadcrumbs
    else
      about_page = StaticPageHelper.preview_for(:home)
      @breadcrumbs = [
        { name: StaticPageHelper.preview_for(:home).name, url: root_path },
        { name: I18n.t('header.learn_more'), url: static_page_path(about_page) },
        { name: @static_page.name },
      ]
    end

    set_metadata(@static_page)
  rescue ActiveRecord::RecordNotFound => e
    @article = Article.publicly_visible.type_event.friendly.find(params[:id])
    redirect_to @article, status: :moved_permanently if @article.present?
  end

end
