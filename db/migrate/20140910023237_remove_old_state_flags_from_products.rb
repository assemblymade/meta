class RemoveOldStateFlagsFromProducts < ActiveRecord::Migration
  def change
    remove_column :products, :submitted_at
    remove_column :products, :evaluated_at
    remove_column :products, :is_approved
    remove_column :products, :launched_at
  end
end
