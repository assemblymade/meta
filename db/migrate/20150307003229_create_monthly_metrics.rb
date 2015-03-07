class CreateMonthlyMetrics < ActiveRecord::Migration
  def change
    create_table :monthly_metrics, id: :uuid do |t|
      t.datetime :created_at,       null: false
      t.datetime :updated_at,       null: false
      t.uuid :product_id,           null: false
      t.date :date,                 null: false
      t.integer :ga_uniques,        null: false

      t.index :product_id
    end

    add_foreign_key :monthly_metrics, :products
  end
end
