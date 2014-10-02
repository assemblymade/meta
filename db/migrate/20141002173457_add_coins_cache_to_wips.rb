class AddCoinsCacheToWips < ActiveRecord::Migration
  def change
    change_table :wips do |t|
      t.integer :earnable_coins_cache
      t.integer :total_coins_cache
    end
  end
end
