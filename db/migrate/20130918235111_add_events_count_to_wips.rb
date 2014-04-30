class AddEventsCountToWips < ActiveRecord::Migration
  def change
    add_column :wips, :events_count, :integer, null: false, default: 0

    Wip.find_each do |wip|
      Wip.reset_counters(wip.id, :events)
    end
  end
end
