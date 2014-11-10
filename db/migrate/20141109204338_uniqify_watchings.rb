class UniqifyWatchings < ActiveRecord::Migration
  def change
    execute 'DELETE FROM watchings
              WHERE id IN (SELECT id
              FROM (SELECT id,
                       row_number() over (partition BY user_id, watchable_id ORDER BY id) AS rnum
                     FROM watchings) t
              WHERE t.rnum > 1)'

    add_index :watchings, [:user_id, :watchable_id], unique: true
  end
end
