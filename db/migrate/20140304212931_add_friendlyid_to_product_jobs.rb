class AddFriendlyidToProductJobs < ActiveRecord::Migration
  def change
    add_column :product_jobs, :slug, :string
    add_index :product_jobs, :slug, unique: true
  end
end
