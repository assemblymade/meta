class BountyListSerializer < ApplicationSerializer
  include MarkdownHelper

  attributes :earnable_coins_cache, :title, :number, :comments_count
  attributes :url

  has_one :locker
  has_one :urgency
  has_one :user

  has_many :tags

  def url
    product_wip_path(object.product, object)
  end

  def locker
    User.find_by(id: object.locked_by)
  end
end
