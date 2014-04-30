class AddSlugToStatusUpdates < ActiveRecord::Migration
  def change
    add_column :status_updates, :slug, :string
    add_index :status_updates, [:product_id, :slug], unique: true
  end
end
