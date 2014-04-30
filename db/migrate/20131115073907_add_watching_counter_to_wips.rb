class AddWatchingCounterToWips < ActiveRecord::Migration
  def change
    add_column :wips, :watchings_count, :integer, null: false, default: 0

    Wip.find_each do |wip|
      Wip.reset_counters(wip.id, :watchings)
    end
  end
end
