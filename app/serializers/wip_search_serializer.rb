class WipSearchSerializer < ActiveModel::Serializer
  attributes :title,
             :number,
             :url

  def url
    product_wip_path(object.product, object)
  end
end
