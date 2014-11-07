class CreateChronicles < ActiveRecord::Migration
  def change
    create_table :chronicles do |t|
      t.uuid :user_id
      t.timestamps
    end

  end
end
