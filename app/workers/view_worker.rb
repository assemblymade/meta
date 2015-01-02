class ViewWorker

  VIEW_PRODUCT_MARKING_WEIGHT = 0.002
  VIEW_BOUNTY_MARKING_WEIGHT = 0.002

  include Sidekiq::Worker
  def perform(user_id, viewable_id, viewable_type)
    if viewable_type == "Wip"
      MakeMarks.new.mark_with_object_for_viewings(user_id, viewable_id, viewable_type, VIEW_BOUNTY_MARKING_WEIGHT)
    elsif viewable_type == "Product"
      MakeMarks.new.mark_with_object_for_viewings(user_id, viewable_id, viewable_type, VIEW_PRODUCT_MARKING_WEIGHT)
    end
  end
end
