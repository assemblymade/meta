class RemoveCardLast4OnUser < ActiveRecord::Migration
  def change
    remove_column :users, :last4
  end
end
