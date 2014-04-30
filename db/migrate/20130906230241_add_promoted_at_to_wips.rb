class AddPromotedAtToWips < ActiveRecord::Migration
  def change
    change_table :wips do |t|
      t.datetime :promoted_at
      t.index [:product_id, :promoted_at]
    end
  end
end
