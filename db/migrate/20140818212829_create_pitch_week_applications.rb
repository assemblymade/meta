class CreatePitchWeekApplications < ActiveRecord::Migration
  def change
    create_table :pitch_week_applications, id: :uuid do |t|
      t.uuid      :product_id,    null: false
      t.uuid      :applicant_id,  null: false
      t.boolean   :is_approved
      t.datetime  :reviewed_at
      t.timestamps
    end
  end
end
