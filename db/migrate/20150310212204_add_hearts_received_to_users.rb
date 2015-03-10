class AddHeartsReceivedToUsers < ActiveRecord::Migration
  def change
    add_column :users, :hearts_received, :integer, default: 0, null: false

    User.find_each do |u|
      u.update_column(
        :hearts_received, NewsFeedItem.where(source_id: u.id).sum(:hearts_count) +
                         NewsFeedItemComment.where(user_id: u.id).sum(:hearts_count)
      )
    end
  end
end
