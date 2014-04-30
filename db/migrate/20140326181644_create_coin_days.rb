class CreateCoinDays < ActiveRecord::Migration
  def change
    create_table :coin_days, id: :uuid do |t|
      t.uuid     :product_id, null: false
      t.uuid     :user_id,    null: false
      t.date     :date,       null: false
      t.decimal  :coins,      null: false
    end
  end
end
