class CreateProductJobs < ActiveRecord::Migration
  def change
    create_table :product_jobs, id: false do |t|
      t.primary_key :id, :uuid, default: nil
      t.uuid :user_id, null: false
      t.uuid :product_id, null: false
      t.string :category
      t.text :description
      t.timestamps
    end
  end
end
