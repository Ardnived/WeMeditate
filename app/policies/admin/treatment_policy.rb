module Admin
  class TreatmentPolicy < Admin::ApplicationPolicy

    def manage?
      return false unless can_access_locale?
      return true if admin?
      return false
    end

    def update?
      update_structure? || update_translation?
    end

    def update_translation?
      return false unless can_access_locale?
      return true if admin? || editor?
      return true if translator? && can_translate? # This call is a bit more costly
      return false
    end

    def update_structure?
      manage?
    end

    def create?
      manage?
    end

    def publish?
      manage?
    end

    def review?
      publish?
    end

  end
end
