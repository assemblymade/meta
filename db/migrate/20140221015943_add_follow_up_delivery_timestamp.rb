class AddFollowUpDeliveryTimestamp < ActiveRecord::Migration
  def change
    add_column :users, :followed_up_on, :datetime
  end
end
