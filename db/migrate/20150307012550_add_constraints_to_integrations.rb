class AddConstraintsToIntegrations < ActiveRecord::Migration
  def change
    # deduplicate rows
    execute 'DELETE FROM integrations
              WHERE id IN (SELECT id
              FROM (SELECT id,
                       row_number() over (partition BY product_id ORDER BY id) AS rnum
                     FROM integrations) t
              WHERE t.rnum > 1)'

    add_index :integrations, :product_id, unique: true
  end
end
