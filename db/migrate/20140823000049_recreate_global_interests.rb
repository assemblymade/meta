class RecreateGlobalInterests < ActiveRecord::Migration
  def change
    create_table :global_interests, id: :uuid do |t|
      t.uuid     :user_id, index: true
      t.datetime :design
      t.datetime :frontend
      t.datetime :backend
      t.datetime :marketing

      t.timestamps
    end
  end
end
