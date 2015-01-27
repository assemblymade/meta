class KillMarkOrphans < ActiveRecord::Migration
  def change
    Marking.includes(:mark).find_each{|m| m.destroy if m.mark.nil? }

    add_foreign_key :markings, :marks
  end
end
