class ViewWorker

  VIEW_PRODUCT_MARKING_WEIGHT = 0.002

  include Sidekiq::Worker
  def perform(user_id, viewable_id, viewable_type)

    viewable = Product.find(viewable_id)

    applicable_viewings = Viewing.where(user_id: user_id, viewable_id: viewable_id)
    previous_views = applicable_viewings.count

    view_weight = 1.0# / (1.0 + previous_views)

    if previous_views == 0
      Viewing.create!({user_id: user_id, viewable_id: viewable_id, viewable_type: viewable_type, weight: view_weight})
      AdjustMarkings.perform_async(user_id, viewable.id, "Product", VIEW_PRODUCT_MARKING_WEIGHT* Math.sqrt(view_weight))

    else
      new_weight = applicable_viewings.first.weight + view_weight
      applicable_viewings.first.update(weight: new_weight)
      diff = Math.sqrt(new_weight) - Math.sqrt(view_weight)
      AdjustMarkings.perform_async(user_id, viewable.id, "Product", VIEW_PRODUCT_MARKING_WEIGHT * diff)
    end

  end
end
