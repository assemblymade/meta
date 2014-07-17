class AddSumTipCentsToTippables < ActiveRecord::Migration
  def change
    add_column :activities, :sum_tip_cents, :integer, default: 0
    add_column :events, :sum_tip_cents, :integer, default: 0

    Tip.all.select{|t| t.via.nil? }.each{|t| t.delete }

    Tip.all.includes(:via).find_each do |tip|
      tip.update_sum_tip_cents_cache!
    end
  end
end
