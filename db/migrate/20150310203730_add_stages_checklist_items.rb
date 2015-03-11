class AddStagesChecklistItems < ActiveRecord::Migration
  def change

    create_table :checklist_items, id: :uuid do |t|
      t.datetime :created_at,       null: false
      t.datetime :updated_at,       null: false
      t.string :state
      t.uuid :user_id
      t.uuid :product_id
    end

    create_table :stages, id: :uuid do |t|
      t.string :name
      t.datetime :created_at
      t.datetime :updated_at
      t.string :description
    end

    create_table :checklist_types, id: :uuid do |t|
      t.string :name
      t.string :description
      t.uuid :stage_id
    end

    add_column :products, :stage_id, :uuid
    add_index :products, :stage_id

  end
end
