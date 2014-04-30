class AddLabelsToWips < ActiveRecord::Migration
  def change
    add_column :wips, :labels, :text, :array => true, :default => '{}'
  end
end
