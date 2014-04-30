class CreatePerks < ActiveRecord::Migration
  def change
    create_table :perks, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.uuid :idea_id
      t.integer :amount
      t.text :description

      t.timestamps
    end
  end
end
