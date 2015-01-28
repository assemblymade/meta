class AddBackgroundToShowcases < ActiveRecord::Migration
  def change
    add_column :showcases, :background, :string
  end
end
