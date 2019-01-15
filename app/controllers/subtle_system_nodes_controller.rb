class SubtleSystemNodesController < ApplicationController

  def index
    @static_page = StaticPage.preload_for(:content).find_by(role: :subtle_system)
    @metadata_record = @static_page
    @breadcrumbs = [
      { name: StaticPageHelper.preview_for(:home).name, url: root_path },
      { name: @static_page.name }
    ]
  end

  def show
    @subtle_system_node = SubtleSystemNode.preload_for(:content).friendly.find(params[:id])
    subtle_system_page = StaticPage.preload_for(:preview).find_by(role: :subtle_system)
    @metadata_record = @subtle_system_node
    @breadcrumbs = [
      { name: StaticPageHelper.preview_for(:home).name, url: root_path },
      { name: subtle_system_page.name, url: subtle_system_nodes_path },
      { name: @subtle_system_node.name }
    ]
  end

end
