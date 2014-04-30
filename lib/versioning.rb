module Versioning
  extend ActiveSupport::Concern

  included do
    has_many :versions, :as => :versioned

    after_update :create_version, :if => :body_changed? # hardcoded to comment body

    attr_accessor :updated_by
  end

  module ClassMethods
  end

  def version
    versions.maximum(:number) || 1
  end

  def create_version
    versions.create!(modifications: body_was, number: version + 1, user: updated_by).inspect
  end
end