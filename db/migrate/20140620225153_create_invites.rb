class CreateInvites < ActiveRecord::Migration
  def change
    create_table :invites, id: :uuid do |t|
      t.uuid :invitor_id,     null: false
      t.uuid :via_id
      t.text :via_type
      t.text :note
      t.integer :tip_cents,   null: false

      t.uuid :invitee_id
      t.text :invitee_email

      t.timestamps

      t.datetime :sent_at
      t.datetime :deleted_at
      t.datetime :claimed_at
    end
  end
end
