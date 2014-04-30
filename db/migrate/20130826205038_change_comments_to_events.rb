class ChangeCommentsToEvents < ActiveRecord::Migration
  def up
    drop_table :comments

    create_table :events, id: false do |t|
      t.uuid    :id,       null: false
      t.integer :number,   null: false
      t.uuid    :wip_id,   null: false
      t.uuid    :user_id,  null: false

      t.string  :type, null: false

      # comments
      t.text :body

      # pull requests
      t.text :url

      t.timestamps
    end
  end

  def down
    create_table :comments, id: false do |t|
      t.primary_key :id, :uuid,   default: nil
      t.uuid :user_id,            null: false
      t.uuid :commentable_id,     null: false
      t.string :commentable_type, null: false
      t.string :body,             null: false
      t.integer :number, null: false
      t.timestamps

      t.index [:commentable_id, :number], unique: true
    end

    drop_table :events
  end
end
