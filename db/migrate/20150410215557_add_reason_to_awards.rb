class AddReasonToAwards < ActiveRecord::Migration
  def change
    add_column :awards, :reason, :text
  end
end
