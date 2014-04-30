class AddTechStackToProducts < ActiveRecord::Migration
  def change
    add_column :products, :tech_stack, :string, array: true, default: '{}'
  end
end
