module Admin
  # Filter-type objects have a simpler common type of access which is represented in this class.
  class ApplicationFilterPolicy < Admin::ApplicationPolicy

    def manage?
      return false unless can_access_locale?
      return true if super_admin?
      return false
    end

    def update?
      update_translation? || update_structure?
    end

    def update_translation?
      return false unless can_access_locale?
      return true if admin?
      return false
    end

    def update_structure?
      manage? || (create? && record.new_record?)
    end

    def publish?
      update?
    end

    def create?
      manage?
    end
    
    def sort?
      manage?
    end

  end
end
