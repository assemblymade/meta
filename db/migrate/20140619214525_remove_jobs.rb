class RemoveJobs < ActiveRecord::Migration
  def change
    StreamEvent.where(type: 'StreamEvents::JobProductRole').delete_all
    drop_table :product_roles
    drop_table :product_jobs
  end
end
