class BreakdownResponsivenessByUserType < ActiveRecord::Migration
  def change
    add_column :product_metrics, :core_responsiveness, :float
  end
end
