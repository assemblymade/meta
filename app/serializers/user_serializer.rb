class UserSerializer < ApplicationSerializer
  include MarkdownHelper

  attributes :url, :username, :avatar_url, :product_balance

  def url
    user_path(object)
  end

  def avatar_url
    object.avatar.url(140).to_s
  end

  def product_balance
    TransactionLogEntry.where(user_id: object.id).with_cents.group(:product_id).having('count(*) > 0').count
  end

  def include_product_balance?
    object == scope
  end

end
