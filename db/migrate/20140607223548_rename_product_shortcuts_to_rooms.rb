class RenameProductShortcutsToRooms < ActiveRecord::Migration
  def change
    rename_table :product_shortcuts, :rooms
  end
end
