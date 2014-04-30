class HideFlaggedProducts < ActiveRecord::Migration
  def change
    add_column(:products, :flagged_at, :datetime)
  end
end
