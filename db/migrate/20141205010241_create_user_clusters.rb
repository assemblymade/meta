class CreateUserClusters < ActiveRecord::Migration
  def change
    create_table :user_clusters do |t|

      t.timestamps
    end
  end
end
