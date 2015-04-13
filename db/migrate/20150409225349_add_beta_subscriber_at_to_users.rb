class AddBetaSubscriberAtToUsers < ActiveRecord::Migration
  def change
    add_column :users, :beta_subscriber_at, :datetime 
  end
end
