class AllowWorkerIdToBeNull < ActiveRecord::Migration
  def change
    change_column :transaction_log_entries, :work_id, :uuid, null: true
  end
end
