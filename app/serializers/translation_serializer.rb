class TranslationSerializer < ActiveModel::Serializer
  attributes :title, :product_name

  def title
    object.try(:title) || object.try(:name)
  end

  def product_name
    object.try(:product).try(:name)
  end
end
