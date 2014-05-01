class RenameStatusUpdatesToPosts < ActiveRecord::Migration
  def change
    rename_table :status_updates, :posts
    add_column :posts, :summary, :text
    rename_column :posts, :user_id, :author_id
  end
end
