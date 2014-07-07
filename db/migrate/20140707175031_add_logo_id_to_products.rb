class AddLogoIdToProducts < ActiveRecord::Migration
  def change
    add_column :products, :logo_id, :uuid
  end
end
