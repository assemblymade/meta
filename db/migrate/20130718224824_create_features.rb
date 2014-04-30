class CreateFeatures < ActiveRecord::Migration
  def change
    create_table :features, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.uuid :user_id
      t.uuid :idea_id
      t.text :title
      t.text :body

      t.timestamps
    end
  end
end
