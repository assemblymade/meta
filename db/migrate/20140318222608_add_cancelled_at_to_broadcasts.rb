class AddCancelledAtToBroadcasts < ActiveRecord::Migration
  def change
    add_column :broadcasts, :cancelled_at, :datetime
  end
end
