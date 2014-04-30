class FixBadWipWorkerMigration < ActiveRecord::Migration
  def change
    
    rename_column :wip_workers, :last_reponse_at, :last_response_at
    
  end
end
