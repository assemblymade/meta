class CreateGuests < ActiveRecord::Migration
  def change
    create_table :guests, id: :uuid do |t|
      t.timestamps
      t.text :email, null: false

      t.index :email, unique: true
    end
  end
end
