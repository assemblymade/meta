class DiscussionSerializer < ActiveModel::Serializer
  attributes :id, :number, :title, :url

  def url
    product_discussion_path product, number
  end

  def product
    @product ||= object.product
  end
end