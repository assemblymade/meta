class ChangeCoinDayFromAmountToCents < ActiveRecord::Migration
  def change
    drop_table :coin_days

    create_table :coin_days, id: :uuid do |t|
      t.uuid     :product_id, null: false
      t.uuid     :user_id,    null: false
      t.date     :date,       null: false
      t.integer  :cents,      null: false
    end
  end
end
