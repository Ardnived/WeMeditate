module Admin
  class ApplicationPolicy < ::ApplicationPolicy

    class Scope < Scope
      def resolve
        if user.translator?
          scope.needs_translation(user)
        else
          scope
        end
      end
    end

    def index?
      update? || create? || destroy?
    end

    def show?
      record.has_content? && index?
    end

    def destroy?
      return false unless super_admin? && can_access_locale?
      return false unless !record.respond_to?(:translated_locales) || record.translated_locales&.include?(I18n.locale)
      return true
    end

    def sort?
      false
    end

    def review?
      false
    end

    def approve?
      review?
    end

    def preview?
      update?
    end

    def update_translation?
      update?
    end

    def update_structure?
      update?
    end

    def write?
      update?
    end

    def upload?
      update? || write?
    end

    # HELPER METHODS
    def admin?
      regional_admin? || super_admin?
    end

    def super_admin?
      user.super_admin?
    end

    def regional_admin?
      user.regional_admin?
    end

    def editor?
      user.editor?
    end

    def writer?
      user.writer?
    end

    def translator?
      user.translator?
    end

    def can_access_locale?
      user.available_languages.include? I18n.locale
    end

    def owns_record?
      return record.owner == user if record.respond_to?(:owner)
      return record.user == user if record.respond_to?(:user)
      return true
    end

    def needs_translation?
      return true if record.is_a?(Class)
      record.class.needs_translation(user).exists?(record.id)
    end

  end
end
