class CreateContractHolder < ActiveRecord::Migration
  def change
    create_table :contract_holders, id: :uuid do |t|
      t.uuid :product_id,   null: false
      t.uuid :user_id,      null: false
      t.integer :annuity,   null: false
      t.timestamps
    end
  end
end
