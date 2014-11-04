class AddConfigToIntegrations < ActiveRecord::Migration
  def change
    add_column :integrations, :config, :json
  end
end
