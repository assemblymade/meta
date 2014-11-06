class CreateChronicles < ActiveRecord::Migration
  def change
    create_table :chronicles do |t|
      t.string :user_id
      t.timestamps
    end

  end
end
