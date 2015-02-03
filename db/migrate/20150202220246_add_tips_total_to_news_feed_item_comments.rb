class AddTipsTotalToNewsFeedItemComments < ActiveRecord::Migration
  def change
    add_column :news_feed_item_comments, :tips_total, :integer, null: false, default: 0

    NewsFeedItemComment.includes(:news_feed_item, :tips).find_each do |comment|
      if comment.news_feed_item.nil?
        puts "removing orphan comment #{comment}"
        comment.destroy
      else
        comment.update!(tips_total: comment.tips.map(&:cents).reduce(0, :+))
      end
    end
  end
end
