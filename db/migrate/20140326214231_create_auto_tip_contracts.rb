class CreateAutoTipContracts < ActiveRecord::Migration
  def change
    create_table :auto_tip_contracts do |t|
      t.uuid      :product_id, null: false
      t.uuid      :user_id,    null: false
      t.decimal   :amount,     null: false
      t.datetime  :created_at, null: false
      t.datetime  :deleted_at
    end
  end
end
