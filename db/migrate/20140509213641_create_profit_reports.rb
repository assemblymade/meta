class CreateProfitReports < ActiveRecord::Migration
  def change
    create_table :profit_reports, id: :uuid do |t|
      t.uuid :product_id, null: false
      t.date :end_at,     null: false
      t.integer :profit,  null: false
      t.integer :royalty, null: false
    end
  end
end
