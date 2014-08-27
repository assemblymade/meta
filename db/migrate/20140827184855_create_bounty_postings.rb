class CreateBountyPostings < ActiveRecord::Migration
  def change
    create_table :bounty_postings do |t|
      t.uuid :bounty_id,      null: false
      t.uuid :poster_id,      null: false

      t.datetime :created_at, null: false
      t.datetime :expired_at

      t.index [:expired_at, :bounty_id], unique: true
    end
  end
end
