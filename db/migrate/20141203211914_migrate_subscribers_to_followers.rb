class MigrateSubscribersToFollowers < ActiveRecord::Migration
  def change
    Subscriber.includes(:product).where.not(user_id: nil).find_each do |s|
      if watching = Watching.unscoped.find_by(user_id: s.user_id, watchable: s.product)
        puts "refollowing #{s.product.slug}"
        watching.update(unwatched_at: nil, auto_subscribed_at: true)
      else
        puts "following #{s.product.slug}"
        watching = Watching.create!(user_id: s.user_id, watchable: s.product, auto_subscribed_at: true)
      end
      watching
    end
  end
end
