class AddDeletedAtToAttachmentsAssetsAndScreenshots < ActiveRecord::Migration
  def change
    add_column :attachments, :deleted_at, :datetime
    add_column :assets, :deleted_at, :datetime
    add_column :screenshots, :deleted_at, :datetime
  end
end
