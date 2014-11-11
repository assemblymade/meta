class MigrateMutesToWatchings < ActiveRecord::Migration
  def up
    Wip.includes(:events, :mutings).find_each do |wip|
      follower_ids = [wip.user_id] | wip.events.pluck(:user_id).uniq
      follower_ids -= wip.mutings.pluck(:user_id)
      follower_ids.each do |follower_id|
        if Watching.unscoped.where(user_id: follower_id, watchable: wip).empty?
          watching = Watching.new(user_id: follower_id, watchable: wip)
          watching.save!(validate: false)
        end
      end
    end
  end
end
