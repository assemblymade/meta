class CreateSavedSearches < ActiveRecord::Migration
  def change
    create_table :saved_searches, id: :uuid do |t|
      t.uuid :user_id, nil: false
      t.text :query,   nil: false
      t.timestamps
    end
  end
end
