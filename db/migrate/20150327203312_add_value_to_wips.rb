class AddValueToWips < ActiveRecord::Migration
  def change
    add_column :wips, :value, :integer
  end
end
