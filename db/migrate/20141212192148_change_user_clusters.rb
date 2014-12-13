class ChangeUserClusters < ActiveRecord::Migration
  def change
    add_column :users, :user_cluster_id, :uuid
    drop_table :user_clusters
    create_table :user_clusters, id: :uuid do |t|
      t.float :variance
      t.timestamps
    end
  end
end
