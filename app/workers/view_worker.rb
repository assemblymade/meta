class ViewWorker
  include Sidekiq::Worker
  def perform(user_id, viewable_id, viewable_type)

    applicable_viewings = Viewing.where(user_id: user_id, viewable_id: viewable_id)
    previous_views = applicable_viewings.count

    view_weight = 1.0# / (1.0 + previous_views)

    if previous_views == 0
      Viewing.create!({user_id: user_id, viewable_id: viewable_id, viewable_type: viewable_type, weight: view_weight})
      
    else
      new_weight = applicable_viewings.first.weight + view_weight
      applicable_viewings.first.update(weight: new_weight)
    end

  end
end
