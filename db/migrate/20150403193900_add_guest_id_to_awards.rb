class AddGuestIdToAwards < ActiveRecord::Migration
  def change
    add_column :awards, :guest_id, :uuid
    add_column :awards, :token, :text

    add_index :awards, :token, unique: true
  end
end
