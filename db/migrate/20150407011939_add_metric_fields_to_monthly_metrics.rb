class AddMetricFieldsToMonthlyMetrics < ActiveRecord::Migration
  def change
    add_column :monthly_metrics, :uniques, :integer
    add_column :monthly_metrics, :visits, :integer
    add_column :monthly_metrics, :registered_visits, :integer
    add_column :monthly_metrics, :total_accounts, :integer
    add_column :monthly_metrics, :uniques_override, :integer
    add_column :monthly_metrics, :total_accounts_override, :integer

    change_column :monthly_metrics, :ga_uniques, :integer, null: true
  end
end
