class AddRecentProductsToUsers < ActiveRecord::Migration
  def change
    add_column :users, :recent_product_ids, :uuid, array: true

    User.joins(:watchings).each do |user|
      user.update_columns recent_product_ids: user.watched_product_ids
    end
  end
end
