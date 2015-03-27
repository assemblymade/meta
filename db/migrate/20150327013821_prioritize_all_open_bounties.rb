class PrioritizeAllOpenBounties < ActiveRecord::Migration
  def change
    Product.find_each do |product|
      tasks = product.tasks.where.not(state: ['closed', 'resolved'])
      rankings_query = tasks.select('id, row_number() OVER (ORDER BY priority ASC NULLS FIRST) AS priority').to_sql 
      tasks.where('wips.id = rankings.id').update_all("priority = rankings.priority FROM (#{rankings_query}) rankings")
    end
  end
end
