class CreateVotes < ActiveRecord::Migration
  def change
    create_table :votes, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.uuid        :idea_id,    null: false
      t.uuid        :user_id,    null: false
      t.integer     :amount,     null: false
      t.inet        :ip,         null: false
      t.datetime    :created_at, null: false
    end
  end
end
