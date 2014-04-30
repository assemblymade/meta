class IdeaSerializer < ActiveModel::Serializer
  include ActionView::Helpers::AssetTagHelper

  attributes :id, :url
  attributes :name, :pitch, :description, :hero_image_url

  attribute :created_at, :key => :created
  attribute :updated_at, :key => :updated

  has_one :user, :key => :submitter

  def url
    product_path(object)
  end

  def hero_image_url
    ActionController::Base.helpers.image_path(object.poster_image.url)
  end

end
