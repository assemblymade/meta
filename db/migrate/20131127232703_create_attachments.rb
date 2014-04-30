class CreateAttachments < ActiveRecord::Migration
  def change
    create_table :attachments, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.uuid    :user_id,       nil: false
      t.string  :asset_path,    nil: false
      t.string  :name,          nil: false
      t.string  :content_type,  nil: false
      t.integer :size,          nil: false

      t.datetime :created_at
    end
  end
end
