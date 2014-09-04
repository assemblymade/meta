class AllowWorkerIdToBeNull < ActiveRecord::Migration
  def up
    change_column :transaction_log_entries, :work_id, :uuid, null: true
  end

  def down
    change_column :transaction_log_entries, :work_id, :uuid, null: false, default: SecureRandom.uuid
  end
end
