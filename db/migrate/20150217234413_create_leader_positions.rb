class CreateLeaderPositions < ActiveRecord::Migration
  def change
    create_table :leader_positions, id: :uuid do |t|
      t.string :leader_type
      t.integer :rank
      t.timestamps null: false
      t.uuid :user_id
    end
    
  end
end
