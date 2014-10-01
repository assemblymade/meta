class AddStateToProducts < ActiveRecord::Migration
  def change
    add_column :products, :state, :string
    add_index :products, :state
  end
end
