class ChangeSlugOnProductsToAllowNull < ActiveRecord::Migration
  def change
    change_column :products, :slug, :string, null: true
  end
end
