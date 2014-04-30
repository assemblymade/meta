class RenameBroadcastsToNewsletters < ActiveRecord::Migration
  def change
    rename_table :broadcasts, :newsletters
  end
end
