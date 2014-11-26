class CreateIdeas < ActiveRecord::Migration
  def change
    create_table :ideas, id: false do |t|
      t.primary_key :id, :uuid, default: nil
      t.string :slug,     null: false
      t.string :name,     null: false
      t.text :body
      t.uuid :user_id, null: false
      t.boolean :claimed, default: false
      t.uuid :product_id

      t.timestamps
    end
  end
end
