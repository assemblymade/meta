class RemoveSomedayUrgencyMultiplier < ActiveRecord::Migration
  def change
    Task.where(multiplier: 0.5).update_all(multiplier: 0.75)
  end
end
