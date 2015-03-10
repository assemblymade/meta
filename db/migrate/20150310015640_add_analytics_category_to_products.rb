class AddAnalyticsCategoryToProducts < ActiveRecord::Migration
  def change
    add_column :products, :analytics_category, :text
  end
end
