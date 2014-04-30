class CreateCoreTeamMemberships < ActiveRecord::Migration
  def change
    create_table :core_team_memberships, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.uuid :product_id, null: false
      t.uuid :user_id, null: false

      t.datetime :created_at
    end
  end
end
