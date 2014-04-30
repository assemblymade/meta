class AddFlagReason < ActiveRecord::Migration
  def change
    add_column(:products, :flagged_reason, :text)
  end
end
