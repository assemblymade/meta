class AddAttachmentsToEvents < ActiveRecord::Migration
  def change
    add_column :events, :attachments, :uuid, array: true, default: []
  end
end
