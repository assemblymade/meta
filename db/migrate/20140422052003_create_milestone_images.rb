class CreateMilestoneImages < ActiveRecord::Migration
  def change
    create_table :milestone_images, id: :uuid do |t|
      t.uuid :user_id,        null: false
      t.uuid :milestone_id,   null: false
      t.uuid :attachment_id,  null: false
      t.datetime :created_at, null: false
    end
  end
end
