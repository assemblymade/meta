class AddHeartCounterCacheToWips < ActiveRecord::Migration
  def change
    add_column :wips, :hearts_count, :integer, null: false, default: 0

    Wip.find_each do |wip|
      wip.update_column(:hearts_count, Heart.where(heartable_id: wip.id).count)
    end
  end
end
