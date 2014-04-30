class AddDeletedAtToWhiteboardAssets < ActiveRecord::Migration
  def change
    add_column :whiteboard_assets, :deleted_at, :datetime
  end
end
