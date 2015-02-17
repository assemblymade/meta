class CreateMarkClusters < ActiveRecord::Migration
  def change
    create_table :mark_clusters, id: :uuid do |t|
      t.timestamps null: false
      t.string :name
    end
    add_column :marks, :mark_cluster_id, :uuid
  end
end
