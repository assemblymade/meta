class AddRevenueAndExpensesToProfitReport < ActiveRecord::Migration
  def change
    ProfitReport.destroy_all
    change_table :profit_reports do |t|
      t.integer :revenue, null: false
      t.integer :expenses, null: false

      t.remove :profit
    end
  end
end
