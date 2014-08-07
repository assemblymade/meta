class TaskSerializer < ApplicationSerializer
  include ReadraptorTrackable

  attributes :number, :title, :url, :body_preview
  attributes :state, :urgency

  def url
    product_wip_path product, (number || id)
  end

  def product
    @product ||= object.product
  end

  def body_preview
    object.description
  end
end
