class WipTaggingSerializer < ActiveModel::Serializer
  attributes :url, :color, :name

  def name
    object.tag.name
  end

  def color
    object.tag.color
  end

  def url
    product_wips_path(object.wip.product, tag: object.tag.name)
  end

end
