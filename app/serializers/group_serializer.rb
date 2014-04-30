class GroupSerializer < ActiveModel::Serializer
  include MarkdownHelper

  attributes :url
  attributes :name, :description_html

  def url
    product_group_path(object.product, object)
  end

  def description_html
    markdown(object.description)
  end

end
