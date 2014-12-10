class AddPriorityToWips < ActiveRecord::Migration
  def change
    add_column :wips, :priority, :integer
    add_index :wips, [:product_id, :priority]

    Product.find_each do |product|
      tasks = product.tasks.where(state: 'open')
      rankings_query = tasks.select('id, row_number() OVER (ORDER BY multiplier DESC) AS priority').to_sql
      tasks.where('wips.id = rankings.id').update_all("priority = rankings.priority FROM (#{rankings_query}) rankings")
    end
  end
end
