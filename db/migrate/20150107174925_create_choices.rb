class CreateChoices < ActiveRecord::Migration
  def change
    create_table :choices, id: :uuid do |t|
      t.float :value
      t.float :weight
      t.string :type
      t.uuid :proposal_id
      t.uuid :user_id
      t.timestamps
    end

  end
end
