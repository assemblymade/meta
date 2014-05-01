class AddCommitCountToProducts < ActiveRecord::Migration
  def change
    add_column :products, :commit_count, :integer, default: 0, null: false
  end
end
