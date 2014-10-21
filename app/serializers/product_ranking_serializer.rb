class ProductRankingSerializer < ApplicationSerializer

  attributes :url
  attributes :name, :pitch, :slug, :state, :quality, :watchings_count, :last_activity_at, :open_tasks_count

  def url
    product_path(object)
  end

end
