class CacheCoinsOnWips < ActiveRecord::Migration
  def change
    Task.find_each do |task|
      task.contracts.tap do |c|
        task.update_columns(
          total_coins_cache: c.total_cents,
          earnable_coins_cache: c.earnable_cents
        )
      end
    end
  end
end
