class ChangeStartedTeambuildingAtToStartedTeamBuildingAtOnProducts < ActiveRecord::Migration
  def change
    rename_column :products, :started_teambuilding_at, :started_team_building_at
  end
end
