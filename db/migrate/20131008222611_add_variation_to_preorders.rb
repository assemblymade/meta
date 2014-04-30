class AddVariationToPreorders < ActiveRecord::Migration
  def change
    add_column :preorders, :variation, :text
  end
end
