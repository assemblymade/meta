class CreateWithdrawals < ActiveRecord::Migration
  def change
    create_table :user_withdrawals, id: :uuid do |t|
      t.uuid      :user_id,         null: false
      t.integer   :reference,       null: false
      t.integer   :total_amount,    null: false
      t.integer   :amount_withheld, null: false
      t.datetime  :payment_sent_at
      t.timestamps
    end
  end
end
