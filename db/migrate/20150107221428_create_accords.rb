class CreateAccords < ActiveRecord::Migration
  def change
    create_table :accords, id: :uuid do |t|
      t.string :type
      t.string :state
      t.uuid :proposal_id
      t.timestamps
    end
  end
end
