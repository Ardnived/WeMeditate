class StaticPagesController < ApplicationController

  def show
    @static_page = StaticPage.includes(:sections).friendly.find(params[:id])
    @metatags = @static_page.get_metatags

    case @static_page.role
    when 'about'
      @breadcrumbs = [
        { name: 'Home', url: root_path },
        { name: @static_page.title }
      ]
    else
      about_page = StaticPage.find_by(role: :about)
      @breadcrumbs = [
        { name: 'Home', url: root_path },
        { name: 'Learn More', url: static_page_path(about_page) },
        { name: @static_page.title }
      ]
    end
  end

end
