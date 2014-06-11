class CreateTeamMemberships < ActiveRecord::Migration
  def change
    create_table :team_memberships, id: :uuid do |t|
      t.uuid    :product_id,  null: false
      t.uuid    :user_id,  null: false
      t.boolean :is_core,  null: false
      t.text    :bio

      t.timestamps
    end


  end
end
