class MoveWipBodyToComment < ActiveRecord::Migration
  def change
    Wip.record_timestamps = false
    Wip.find_each do |wip|
      Wip.transaction do
        if !wip.body.blank?
          Event.where(wip: wip).update_all('number = number + 1')
          Event::Comment.create!(wip: wip, number: 1, user: wip.user, body: wip.body, created_at: wip.created_at, updated_at: wip.created_at)
          wip.update_column(:body, nil)
        end
      end
    end
    Wip.record_timestamps = true
  end
end
