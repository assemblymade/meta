class AddDeletedAtToSubscribers < ActiveRecord::Migration
  def change
    add_column :subscribers, :deleted_at, :datetime

    add_index :subscribers, [:email, :product_id], unique: true
  end
end
