## REQUIRE APPROVAL CONCERN
# This concern should be added to models that require an admin to approve any update,
# before it is reflected in the public-facing website.
# TODO: This feature is not fully implemented and should not yet be used.

module RequireApproval

  def self.included base
    # This code is commented out to temporarily disable the effects of this concern,
    # until issues with the integration of drafts can be resolved.
    #base.paper_trail_options[:on] << :update
    #base.after_update :cycle_versions, if: Proc.new{ |r| !r.skip_version_cycle? }
  end

  def published?
    published_at != nil
  end

  def draft?
    drafts.present?
  end

  def live
    paper_trail.version_at(published_at)
  end

  def last_changed_by
    if versions.present? and versions.last.whodunnit.present?
      User.find(versions.last.whodunnit)
    end
  end

  def drafts
    @drafts ||= begin
      if published?
        self.versions.where('created_at > ?', published_at)
      else
        self.versions
      end
    end
  end

  def publish_drafts!
    update_attribute(:published_at, DateTime.now)
    if self.version.present?
      self.versions.where(['created_at < ?', self.versions.last.created_at]).delete_all
    end
  end

  def discard_drafts!
    self.versions.where(['created_at > ?', published_at]).delete_all
  end

end
