class AddMultiplierToTasks < ActiveRecord::Migration
  def change
    add_column :wips, :multiplier, :decimal, null: false, default: 1.0

    Task.where('promoted_at is not null').each do |task|
      task.update_columns multiplier: 2.0
    end
  end
end
