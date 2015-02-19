class BountyShallowSerializer < ApplicationSerializer
  attributes :title, :hearts_count, :locked_at, :title

  attributes :url

  has_one :locker

  has_one :product, serializer: ProductShallowSerializer

  has_one :user

  has_many :tags

  def url
    product_wip_path(object.product, object)
  end
end
