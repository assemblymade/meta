class Interest < ActiveRecord::Base
  has_many :team_membership_interests

  DEFAULT_INTERESTS = %w(
    design
    copy
    illustration
    ux
    frontend
    backend
    strategy
    marketing
    sales
    growth
    api
    ios
    android
  )

  validates :slug,
    presence: true,
    uniqueness: { case_sensitive: false },
    length: { minimum: 2 },
    format: { with: /\A[a-zA-Z0-9-]+\z/ }

  def to_param
    slug
  end

  def members_in_product(product)
    User.joins(team_memberships: :team_membership_interests).
      where('team_memberships.product_id = ?', product.id).
      where('team_membership_interests.interest_id = ?', self.id)
  end
end
