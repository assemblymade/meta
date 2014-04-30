class CreateProducts < ActiveRecord::Migration
  def change
    create_table :products, id: false do |t|
      t.primary_key :id, :uuid, default: nil
      t.uuid :idea_id,    null: false
      t.string :slug,     null: false
      t.string :name,     null: false

      t.timestamps
    end
  end
end
