class RemoveWipBody < ActiveRecord::Migration
  def change
    remove_column :wips, :body
  end
end
