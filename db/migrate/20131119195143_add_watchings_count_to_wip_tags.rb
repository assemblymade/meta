class AddWatchingsCountToWipTags < ActiveRecord::Migration
  def change
    add_column :wip_tags, :watchings_count, :integer, null: false, default: 0

    Wip::Tag.find_each do |o|
      Wip::Tag.reset_counters(o.id, :watchings)
    end
  end
end
