class CreateFinancialAccounts < ActiveRecord::Migration
  def change
    create_table :financial_accounts, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.uuid    :product_id, null: false
      t.string  :name,       null: false
      t.string  :type,       null: false
      t.boolean :contra,     null: false, default: false

      t.datetime :created_at, null: false
    end
  end
end
