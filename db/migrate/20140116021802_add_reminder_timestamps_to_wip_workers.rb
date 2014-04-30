class AddReminderTimestampsToWipWorkers < ActiveRecord::Migration
  def change
    add_column :wip_workers, :last_checkin_at,  :datetime
    add_column :wip_workers, :last_reponse_at,  :datetime
    add_column :wip_workers, :checkin_count,    :integer, :default => 0
  end
end
