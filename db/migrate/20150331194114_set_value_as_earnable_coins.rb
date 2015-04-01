class SetValueAsEarnableCoins < ActiveRecord::Migration
  def change
    Wip.find_each do |wip|
      begin
        wip.value = wip.respond_to?(:contracts) && wip.contracts.earnable_cents.to_i
        wip.save!
      rescue
      end
    end
  end
end
