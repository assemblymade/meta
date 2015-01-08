class CreateProposals < ActiveRecord::Migration
  def change
    create_table :proposals, id: :uuid do |t|
      t.string :name
      t.string :description
      t.string :state
      t.uuid :product_id
      t.uuid :user_id
      t.timestamps
    end
  end
end
