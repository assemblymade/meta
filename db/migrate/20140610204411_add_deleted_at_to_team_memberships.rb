class AddDeletedAtToTeamMemberships < ActiveRecord::Migration
  def change
    add_column :team_memberships, :deleted_at, :timestamp
  end
end
