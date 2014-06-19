class AddParamsToEmailLogs < ActiveRecord::Migration
  def change
    drop_table :email_logs

    create_table :email_logs, id: :uuid do |t|
      t.uuid        :user_id,    null: false
      t.text        :key,        null: false
      t.hstore      :params,     null: false
      t.datetime    :created_at, null: false
    end
  end
end
