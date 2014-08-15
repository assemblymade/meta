class CreateMailingList < ActiveRecord::Migration
  def change
    create_table :mailing_lists do |t|
      t.datetime :created_at, null: false
      t.string :email,        null: false
      t.uuid :product_id,     null: false
    end
  end
end
