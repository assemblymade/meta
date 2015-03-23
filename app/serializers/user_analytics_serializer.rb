class UserAnalyticsSerializer < ActiveModel::Serializer
  attributes :created_at, :email, :location, :username, :last_sign_in_at, :last_request_at
  attributes :facebook_uid, :username, :twitter_nickname, :github_login

  attributes :id
  attributes :payment_via
  attributes :partner_of, :core_team_of

  attributes :most_recent_product_name
  attributes :most_recent_product_slug

  attributes :most_recent_idea_name
  attributes :most_recent_idea_slug

  attributes :comments, :following, :ideas, :wips

  attributes :most_important_quality

  cached

  def cache_key
    object
  end

  def id
    object.id
  end

  def payment_via
    object.payment_option.try(:type)
  end

  # (whatupdave) this throws on the test database but not the regular one.
  # it's because the schema.rb file doesn't contain the products.id primary key
  # so the test database table doesn't have one
  def core_team_of
    return [] if Rails.env.test?
    object.team_memberships.core_team.joins(:product).pluck('products.name')
  end

  def partner_of
    return [] if Rails.env.test?
    object.partnerships.pluck(:name)
  end

  def following
    object.watchings.where(watchable_type: Product).size
  end

  def comments
    Event::Comment.where(user: object).size
  end

  def most_recent_product_name
    object.products.order(:created_at).last.try(:name)
  end

  def most_recent_product_slug
    object.products.order(:created_at).last.try(:slug)
  end

  def most_recent_idea_name
    most_recent_idea.try(:name)
  end

  def most_recent_idea_slug
    most_recent_idea.try(:slug)
  end

  def most_recent_idea
    @mri ||= object.ideas.order(:created_at).last
  end

  def ideas
    object.products.size
  end

  def wips
    object.wips.size
  end
end
