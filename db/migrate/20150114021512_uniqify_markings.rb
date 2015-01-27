class UniqifyMarkings < ActiveRecord::Migration
  def change
    execute '
      DELETE FROM markings
      WHERE id IN (
        SELECT id
        FROM (
          SELECT id,
          row_number() over (partition BY mark_id, markable_id ORDER BY id) AS rnum
          FROM markings) t
        WHERE t.rnum > 1
      )'

    add_index :markings, [:markable_id, :mark_id], unique: true
  end
end
