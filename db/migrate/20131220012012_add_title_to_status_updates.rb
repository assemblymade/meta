class AddTitleToStatusUpdates < ActiveRecord::Migration
  def change
    add_column :status_updates, :title, :string
  end
end
