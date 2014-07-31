class CreateUserTaxInfos < ActiveRecord::Migration
  def change
    create_table :user_tax_infos, id: :uuid do |t|
      t.uuid :user_id, null: false

      t.string :full_name
      t.string :business_name
      t.string :taxpayer_id
      t.string :taxpayer_type
      t.string :classification
      t.string :address
      t.string :city
      t.string :state
      t.string :zip
      t.string :country
      t.string :foreign_tax_id
      t.string :reference_number
      t.date :date_of_birth
      t.string :signatory
      t.timestamps
    end
  end
end
