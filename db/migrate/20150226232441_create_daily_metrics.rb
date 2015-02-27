class CreateDailyMetrics < ActiveRecord::Migration
  def change
    create_table :daily_metrics, id: :uuid do |t|
      t.datetime :created_at,       null: false
      t.datetime :updated_at,       null: false
      t.uuid :product_id,           null: false
      t.date :date,                 null: false
      t.integer :uniques,           null: false
      t.integer :visits,            null: false
      t.integer :registered_visits, null: false
      t.integer :total_accounts,    null: false

      t.index :product_id
    end

    add_foreign_key :daily_metrics, :products
  end
end
