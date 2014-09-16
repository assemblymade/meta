class AddAmountToAssemblyAssets < ActiveRecord::Migration
  def change
    add_column :assembly_assets, :amount, :integer
  end
end
