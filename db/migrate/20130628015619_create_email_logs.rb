class CreateEmailLogs < ActiveRecord::Migration
  def change
    create_table(:email_logs, id: false) do |t|
      t.primary_key :id, :uuid, default: nil
      t.uuid        :user_id,    null: false
      t.uuid        :email_id,   null: false
      t.datetime    :created_at, null: false
    end

    add_index :email_logs, [:user_id, :email_id]
  end
end
