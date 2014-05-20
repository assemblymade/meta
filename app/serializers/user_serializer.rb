class UserSerializer < BaseSerializer
  include MarkdownHelper

  attributes :url,
             :username, :name, :avatar_url,
             :github_login, :github_url

  has_one :sponsor

  def url
    user_path(object)
  end

  def avatar_url
    object.avatar.url(140).to_s
  end

  def github_url
    "https://github.com/#{github_login}"
  end

  def sponsor
    Corporation.new if object.staff?
  end

  attributes :product_balance

  def product_balance
    TransactionLogEntry.where(user_id: object.id).with_cents.group(:product_id).having('count(*) > 0').count
  end

end
