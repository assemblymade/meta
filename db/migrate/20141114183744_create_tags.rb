class CreateTags < ActiveRecord::Migration
  def change
    create_table :tags, id: :uuid do |t|
      t.string :name, null: false
      t.index :name, unique: true
      t.datetime :created_at
    end
  end
end
