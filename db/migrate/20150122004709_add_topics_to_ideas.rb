class AddTopicsToIdeas < ActiveRecord::Migration
  def change
    add_column :ideas, :topics, :json, default: {}
  end
end
