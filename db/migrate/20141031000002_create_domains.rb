class CreateDomains < ActiveRecord::Migration
  def change
    create_table :domains, id: :uuid do |t|
      t.uuid    :product_id, null: false
      t.string  :name,       null: false
      t.string  :state,      null: false

      t.string  :provider
      t.integer :provider_domain_id
      t.string  :transfer_auth_code

      t.string  :status

      t.timestamps
    end
  end
end
