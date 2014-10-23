class TaskSerializer < ApplicationSerializer
  include ReadraptorTrackable
  include MarkdownHelper

  attributes :number, :title, :url, :body_preview, :value, :markdown_description
  attributes :state, :urgency

  has_many :tags

  def url
    product_wip_path product, (number || id)
  end

  def product
    @product ||= object.product
  end

  def body_preview
    object.description
  end

  def markdown_description
    product_markdown(product, body_preview)
  end

  def value
    WipContracts.new(
      object, object.product.auto_tip_contracts.active
    ).earnable_cents.floor
  end
end
