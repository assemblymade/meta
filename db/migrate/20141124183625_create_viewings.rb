class CreateViewings < ActiveRecord::Migration
  def change
    create_table :viewings, id: :uuid do |t|
      t.uuid :user_id
      t.string :viewable_type
      t.uuid :viewable_id
      t.datetime :created_at
    end

    QueryMarks.new.retroactively_generate_all_user_markings

    #add_index :markings, [:mark_id, :object_id, :object_type], unique: true
  end
end
