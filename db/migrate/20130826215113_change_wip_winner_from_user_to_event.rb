class ChangeWipWinnerFromUserToEvent < ActiveRecord::Migration
  def up
    remove_column :wips, :winner_id
    add_column :wips, :winning_event_id, :uuid
  end

  def down
    add_column :wips, :winner_id, :uuid
    remove_column :wips, :winning_event_id
  end
end
