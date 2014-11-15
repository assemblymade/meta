class CreateTaggings < ActiveRecord::Migration
  def change
    create_table :taggings, id: :uuid do |t|
      t.string :taggable_type
      t.uuid :taggable_id
      t.uuid :tag_id
      t.float :weight
      t.timestamps
    end
  end
end
