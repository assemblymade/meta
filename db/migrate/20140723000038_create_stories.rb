class CreateStories < ActiveRecord::Migration
  def change
    create_table :stories, id: :uuid do |t|
      t.string :verb,         null: false
      t.string :subject_type, null: false
      t.timestamps
    end
  end
end
