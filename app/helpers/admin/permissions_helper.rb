require 'i18n_data'

module Admin
  module PermissionsHelper

    ICONS = {
      create: 'plus',
      translate: 'wrench',
      update: 'wrench',
      publish: 'checkmark',
      destroy: 'warning sign',
    }.freeze

    MATRIX = {
      article: {
        translator: %i[translate],
        editor: {
          update: 'update_own',
          publish: 'publish_own',
          create: true,
        },
        regional_admin: %i[update publish create],
        super_admin: %i[update publish create destroy],
      },
      static_page: {
        translator: %i[translate],
        editor: [],
        regional_admin: %i[update publish],
        super_admin: %i[update publish],
      },
      subtle_system_node: {
        translator: %i[translate],
        editor: [],
        regional_admin: %i[update publish],
        super_admin: %i[update publish],
      },

      meditation: {
        translator: [],
        editor: [],
        regional_admin: %i[update publish create],
        super_admin: %i[update publish create destroy],
      },
      treatment: {
        translator: %i[translate],
        editor: [],
        regional_admin: %i[update publish create],
        super_admin: %i[update publish create destroy],
      },
      track: {
        translator: [],
        editor: [],
        regional_admin: [],
        super_admin: %i[update publish create destroy],
      },

      category: {
        translator: [],
        editor: [],
        regional_admin: %i[update publish],
        super_admin: %i[update publish create destroy],
      },
      goal_filter: {
        translator: [],
        editor: [],
        regional_admin: %i[update publish],
        super_admin: %i[update publish create destroy],
      },
      duration_filter: {
        translator: [],
        editor: [],
        regional_admin: [],
        super_admin: %i[update publish create destroy],
      },
      mood_filter: {
        translator: [],
        editor: [],
        regional_admin: [],
        super_admin: %i[update publish create destroy],
      },
      instrument_filter: {
        translator: [],
        editor: [],
        regional_admin: [],
        super_admin: %i[update publish create destroy],
      },
      artist: {
        translator: [],
        editor: [],
        regional_admin: [],
        super_admin: %i[update publish create destroy],
      },
      author: {
        translator: %i[translate],
        editor: {
          update: 'update_own_bio',
          create: true,
        },
        regional_admin: %i[update create],
        super_admin: %i[update create destroy],
      },

      user: {
        translator: [],
        editor: [],
        regional_admin: {
          update: 'update_subordinate',
          create: 'create_subordinate',
        },
        super_admin: %i[update create destroy],
      },
    }.freeze

    def permissions_matrix roles
      capture do
        MATRIX.each do |model, permission_set|
          concat permission_row(model, permission_set)
        end
      end
    end

    private

      def permission_row model, permission_set
        content_tag :tr do
          concat tag.td(translate model, scope: %i[activerecord models], count: -1)
          permission_set.values.each do |permissions|
            concat tag.td(permission_icons(model, permissions))
          end
        end
      end

      def permission_icons model, permissions
        model_name = translate(model, scope: %i[activerecord models], count: -1)
        
        capture do
          if permissions.is_a? Array
            permissions.each do |permission|
              concat permission_icon(permission, translate(permission, scope: %i[admin permissions], model: model_name))
            end
          else
            permissions.each do |permission, value|
              if value == true
                concat permission_icon(permission, translate(permission, scope: %i[admin permissions], model: model_name))
              else
                concat permission_icon(permission, translate(value, scope: %i[admin permissions special], model: model_name), partial: true)
              end
            end
          end
        end
      end

      def permission_icon type, label, partial: false
        icon = tag.i class: "#{ICONS[type]}#{' disabled' if partial} icon"
        tag.span icon, data: { tooltip: label }
      end

  end
end

