class CreateInterests < ActiveRecord::Migration
  def change
    create_table :interests, id: :uuid do |t|
      t.text :slug,           null: false
      t.datetime :created_at, null: false
    end
  end
end
