class AddNumberToWips < ActiveRecord::Migration
  def change
    change_table :wips do |t|
      t.integer :number, null: false

      t.index [:product_id, :number], unique: true
    end
  end
end
