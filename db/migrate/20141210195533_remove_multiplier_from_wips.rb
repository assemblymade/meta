class RemoveMultiplierFromWips < ActiveRecord::Migration
  def change
    remove_column :wips, :multiplier, :decimal, default: 1.0, null: false
  end
end
