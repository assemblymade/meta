class AddLeadToIdeas < ActiveRecord::Migration
  def change
    change_table :ideas do |t|
      t.string   :lead
    end
  end
end
