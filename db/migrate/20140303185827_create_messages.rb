class CreateMessages < ActiveRecord::Migration
  def change
    create_table :messages, id: :uuid do |t|
      t.uuid :author_id, null: false
      t.text :body
      t.timestamps
    end
  end
end
