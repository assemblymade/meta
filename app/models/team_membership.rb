class TeamMembership < ActiveRecord::Base
  belongs_to :product
  belongs_to :user

  has_many :team_membership_interests

  scope :active, -> { where('deleted_at is null') }
  scope :core_team, -> { where('is_core is true') }
  scope :with_bios, -> { where.not(bio: [nil, '']) }
  scope :with_interests, -> { where('exists(select 1 from team_membership_interests tmi where tmi.team_membership_id = team_memberships.id)') }

  after_commit :update_counter_caches

  def core_team?
    self.is_core
  end

  # private

  def update_counter_caches
    product.update!(
      team_memberships_count: product.team_memberships.active.count,
      bio_memberships_count: product.team_memberships.with_bios.count
    )
  end

end
