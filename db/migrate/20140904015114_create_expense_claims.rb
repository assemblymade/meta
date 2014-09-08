class CreateExpenseClaims < ActiveRecord::Migration
  def change
    create_table :expense_claims, id: :uuid do |t|
      t.uuid :product_id,     null: false
      t.uuid :user_id,        null: false
      t.integer :total,       null: false
      t.string :description

      t.datetime :paid_at
      t.timestamps
    end
  end
end
