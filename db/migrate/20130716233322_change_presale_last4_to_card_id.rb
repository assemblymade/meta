class ChangePresaleLast4ToCardId < ActiveRecord::Migration
  def change
    rename_column :presales, :last4, :card_id
    change_column :presales, :card_id, :string, null: false
  end
end
