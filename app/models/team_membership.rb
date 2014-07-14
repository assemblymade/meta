class TeamMembership < ActiveRecord::Base
  belongs_to :product
  belongs_to :user

  has_many :team_membership_interests

  scope :active, -> { where('deleted_at is null') }
  scope :core_team, -> { where('is_core is true') }

  after_commit :update_counter_cache

  def core_team?
    self.is_core
  end

  # private

  def update_counter_cache
    product.team_memberships_count = product.team_memberships.active.count
    product.save!
  end

end
