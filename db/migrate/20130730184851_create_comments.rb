class CreateComments < ActiveRecord::Migration
  def change
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
  end
end
