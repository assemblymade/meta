class AddVoteIdToPresales < ActiveRecord::Migration
  def up
    drop_table :presales

    create_table(:presales, id: false) do |t|
      t.primary_key :id, :uuid, default: nil
      t.uuid :vote_id, null: false

      t.integer :amount, null: false
      t.string :charge_id
      t.string :last4
      t.datetime :charged_at

      t.timestamps
    end

  end
end
