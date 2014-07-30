class AddW8benFieldsToTaxInfos < ActiveRecord::Migration
  def change
    change_table :user_tax_infos do |t|
      t.string :type, null: false
      t.string :citizenship

      t.string :mailing_address
      t.string :mailing_city
      t.string :mailing_state
      t.string :mailing_zip
      t.string :mailing_country

      t.string :treaty_article
      t.string :treaty_withholding
      t.string :treaty_income_type
      t.string :treaty_reasons

      t.string :signature_capacity
    end
  end
end
