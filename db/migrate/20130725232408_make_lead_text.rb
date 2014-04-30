class MakeLeadText < ActiveRecord::Migration
  def change
    change_column :ideas, :lead, :text
  end
end
