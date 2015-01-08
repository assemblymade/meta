class ChangeCoreRespColumnType < ActiveRecord::Migration
  def up
    change_column :product_metrics, :core_responsiveness, :integer
  end

  def down
    change_column :product_metrics, :core_responsiveness, :float
  end
end
