class AddDescriptionToWips < ActiveRecord::Migration
  def change
    add_column :wips, :description, :text
  end
end
