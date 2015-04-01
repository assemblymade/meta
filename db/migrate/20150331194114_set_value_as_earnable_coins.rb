class SetValueAsEarnableCoins < ActiveRecord::Migration
  def change
    Wip.update_all('value = earnable_coins_cache')
  end
end
