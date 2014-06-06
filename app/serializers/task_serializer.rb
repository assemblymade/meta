class TaskSerializer < ApplicationSerializer
  include ReadraptorTrackable

  attributes :number, :title, :url

  def url
    product_wip_path product, (number || id)
  end

  def product
    @product ||= object.product
  end
end