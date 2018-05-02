module Admin
  class SubtleSystemNodePolicy < Admin::StaticPagePolicy

    def create?
      super_admin? and SubtleSystemNode.available_roles.present?
    end

    def review?
      false
    end

  end
end
