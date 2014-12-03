class AddHeartsCountToActivities < ActiveRecord::Migration
  def change
    add_column :activities, :hearts_count, :integer, default: 0, null: false
  end
end
