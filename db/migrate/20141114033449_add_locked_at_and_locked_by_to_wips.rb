class AddLockedAtAndLockedByToWips < ActiveRecord::Migration
  def change
    add_column :wips, :locked_at, :datetime
    add_column :wips, :locked_by, :uuid
  end
end
