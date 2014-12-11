class MigrateWipWatchingsToNewsFeedItemWatchings < ActiveRecord::Migration
  def change
    missing = []
    Task.includes(:news_feed_item).find_each do |task| # where(id: ['d770be23-3fd0-4ab1-ae0f-d4abc5c16e3d'])
      nfi = task.news_feed_item
      if nfi.nil?
        missing << task
        next
      end

      begin
        Watching.unscoped.where(watchable_id: task.id).update_all(
          watchable_type: NewsFeedItem,
          watchable_id: nfi.id
        )
      rescue ActiveRecord::RecordNotUnique
      end
    end
  end
end
