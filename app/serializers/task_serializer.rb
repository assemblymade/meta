class TaskSerializer < ApplicationSerializer
  include ReadraptorTrackable
  include MarkdownHelper
  include Nokogiri

  attributes :number, :title, :url, :value, :markdown_description
  attributes :state, :urgency, :short_description, :comments_count

  has_many :tags

  def url
    product_wip_path product, (number || id)
  end

  def product
    @product ||= object.product
  end

  def markdown_description
    product_markdown(product, object.description)
  end

  def short_description
    product_markdown(product, object.description.truncate(200, separator: /\s/))
  end

  def value
    WipContracts.new(
      object, object.product.auto_tip_contracts.active
    ).earnable_cents.floor
  end
end
