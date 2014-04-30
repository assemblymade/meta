class CreateWorkApplications < ActiveRecord::Migration
  def change
    create_table :work_applications, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.uuid :user_id, null: false
      t.uuid :idea_id, null: false

      t.datetime :created_at
    end
  end
end
