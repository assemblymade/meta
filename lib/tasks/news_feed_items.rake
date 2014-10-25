namespace :news_feed_items do
  task :seed_comments => :environment do
    NewsFeedItem.where('target_id is not null').each do |item|
      if comments = item.target.try(:comments)
        item.news_feed_item_comments.delete_all
        comments.each do |comment|
          item.news_feed_item_comments.create(
            news_feed_item: item,
            body: comment.body,
            user_id: comment.user.id
          )
        end
      end
    end
  end
end
