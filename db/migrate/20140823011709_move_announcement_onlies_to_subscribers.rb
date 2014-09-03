class MoveAnnouncementOnliesToSubscribers < ActiveRecord::Migration
  def up
    Watching.includes(:user).where(subscription: false).where(watchable_type: Product).each do |w|
      Subscriber.create!(
        email: w.user.email,
        product: w.watchable,
        user: w.user
      )
    end
  end
end
