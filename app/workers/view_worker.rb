class ViewWorker
  include Sidekiq::Worker
  def perform(user_id, viewable_id, viewable_type)
    Viewing.create!({user_id: user_id, viewable_id: viewable_id, viewable_type: viewable_type})
  end
end
