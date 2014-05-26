class CreateRealActivityStream < ActiveRecord::Migration
  def change
    drop_table :activities

    create_table :activities, id: :uuid do |t|
      t.string    :type
      t.uuid      :actor_id
      t.string    :actor_type
      t.uuid      :subject_id
      t.string    :subject_type
      t.uuid      :target_id
      t.string    :target_type
      t.timestamp :created_at
    end
  end
end
