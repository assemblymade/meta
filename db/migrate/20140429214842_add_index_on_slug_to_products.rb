class AddIndexOnSlugToProducts < ActiveRecord::Migration
  def change
    add_index :products, :slug, unique: true
  end
end
