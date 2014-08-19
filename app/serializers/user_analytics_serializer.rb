class UserAnalyticsSerializer < ActiveModel::Serializer
  attributes :created_at, :email, :location, :username, :last_sign_in_at, :last_request_at
  attributes :facebook_uid, :username, :twitter_nickname, :github_login

  attributes :payment_via
  attributes :partner_of, :core_team_of

  attributes :comments, :following, :ideas, :wips

  def payment_via
    object.payment_option.try(:type)
  end

  def core_team_of
    object.team_memberships.core_team.joins(:product).pluck('products.name')
  end

  def partner_of
    Product.
       joins('inner join transaction_log_entries tle on tle.product_id = products.id').
       group('products.name').
       where('wallet_id = ?', object.id).pluck(:name)
  end

  def following
    object.watchings.where(watchable_type: Product).size
  end

  def comments
    Event::Comment.where(user: object).size
  end

  def ideas
    object.products.size
  end

  def wips
    object.wips.size
  end
end
