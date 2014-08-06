class AddCoinsToProfitReports < ActiveRecord::Migration
  def change
    change_table :profit_reports do |t|
      t.integer :coins
      t.integer :annuity
      t.remove :royalty
    end

    ProfitReport.all.each do |report|
      report.update_attributes(
        coins: TransactionLogEntry.to_month_end(report.end_at).where(product: report.product).in_user_wallets.sum(:cents),
      )
    end
  end
end
