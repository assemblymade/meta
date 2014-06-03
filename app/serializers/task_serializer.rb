class TaskSerializer < ActiveModel::Serializer
  attributes :id, :number, :title, :url

  def url
    product_wip_path product, number
  end

  def product
    @product ||= object.product
  end
end