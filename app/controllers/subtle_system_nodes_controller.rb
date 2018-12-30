class SubtleSystemNodesController < ApplicationController

  def index
    @static_page = StaticPage.includes_content.find_by(role: :subtle_system)
    @metatags = @static_page.get_metatags
    @breadcrumbs = [
      { name: StaticPageHelper.preview_for(:home).title, url: root_path },
      { name: @static_page.title }
    ]
  end

  def show
    @subtle_system_node = SubtleSystemNode.includes_content.friendly.find(params[:id])
    subtle_system_page = StaticPage.includes_preview.find_by(role: :subtle_system)
    @metatags = @subtle_system_node.get_metatags
    @breadcrumbs = [
      { name: StaticPageHelper.preview_for(:home).title, url: root_path },
      { name: subtle_system_page.title, url: subtle_system_nodes_path },
      { name: @subtle_system_node.name }
    ]
  end

end
