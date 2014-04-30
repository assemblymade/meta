class RemovePresale < ActiveRecord::Migration
  def change
    remove_column :ideas, :presale_amount
    remove_column :ideas, :presale_description
  end
end
