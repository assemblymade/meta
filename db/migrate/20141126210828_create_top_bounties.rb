class CreateTopBounties < ActiveRecord::Migration
  def change
    create_table :top_bounties, id: :uuid do |t|
      t.uuid :user_id
      t.float :score
      t.integer :rank
      t.timestamps
    end


    create_table :top_products, id: :uuid do |t|
      t.uuid :user_id
      t.float :score
      t.integer :rank
      t.timestamps
    end

  end
end
