class AddNameToPerks < ActiveRecord::Migration
  def change
    add_column :perks, :name, :string, null: false
  end
end
