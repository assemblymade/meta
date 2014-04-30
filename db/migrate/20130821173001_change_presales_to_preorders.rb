class ChangePresalesToPreorders < ActiveRecord::Migration
  def up
    rename_table :presales, :preorders
    change_column :preorders, :vote_id, :uuid, null: true
    add_column :preorders, :perk_id, :uuid
    add_column :preorders, :ip, :inet
  end

  def down
    remove_column :preorders, :ip
    remove_column :preorders, :perk_id
    change_column :preorders, :vote_id, :uuid, null: false
    rename_table :preorders, :presales
  end
end
