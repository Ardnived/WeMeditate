## NAVIGATON HELPER
# This helper generates the elements of the header's navigation bar

module NavigationHelper

  # Return a list of navigation items for desktop
  def navigation_items
    return @navigation if defined? @navigation

    @navigation = []

    # Collect the three basic navigaton links
    %i[meditations articles tracks].each do |role|
      static_page = static_page_preview_for(role)
      @navigation.push({
        title: static_page.name,
        url: static_page_path_for(static_page),
        active: controller_name == role.to_s,
        data: gtm_record(static_page),
      })
    end

    # Define the dropdown navigation.
    kundalini_page = SubtleSystemNode.find_by(role: :kundalini)

    @navigation.push({
      title: I18n.translate('header.learn_more'),
      url: '#', # static_page_path_for(:about),
      data: gtm_label('header.learn_more'),
      active: %w[static_pages subtle_system_nodes].include?(controller_name),
      content: {
        items: %i[sahaja_yoga shri_mataji subtle_system treatments classes].map { |role|
          static_page = static_page_preview_for(role)
          {
            title: static_page.name,
            url: static_page_path_for(static_page),
            data: gtm_record(static_page),
          }
        } + [
          {
            title: translate('header.kundalini').titleize,
            url: url_for(kundalini_page),
            data: gtm_record(kundalini_page),
          },
        ],
        featured: Treatment.published.preload_for(:preview).first(2).map { |treatment|
          {
            title: translate('treatments.title', title: treatment.name),
            url: treatment_path(treatment),
            data: gtm_record(treatment),
            thumbnail: treatment.thumbnail.url,
          }
        },
      },
    })

    @navigation
  end

  # Return a list of navigation items for mobile
  def mobile_navigation_items
    mobile_navigation = []
    # home_page = static_page_preview_for(:home)

    # mobile_navigation.push({
    #   title: home_page.name,
    #   url: static_page_path_for(home_page),
    #   active: controller_name == 'application' && action_name == 'home',
    # })

    # Use the desktop navigation as a base, and then modify it
    mobile_navigation += navigation_items

    # Add classes near me
    mobile_navigation.push({
      title: I18n.translate('header.classes_near_me').gsub('<br>', ' '),
      url: %i[en ru].include?(I18n.locale) ? static_page_path_for(:streams) : static_page_path_for(:classes),
      data: gtm_label('header.classes_near_me'),
      active: controller_name == 'classes',
    })

    mobile_navigation
  end

end
