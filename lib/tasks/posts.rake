namespace :posts do
  task :push_to_news_feed => :environment do
    NewsFeedItem.delete_all(target_type: 'post')

    Post.all.each do |post|
      NewsFeedItem.create(
        product: post.product,
        source_id: post.user.id,
        target: post,
        created_at: post.created_at
      )
    end
  end
end
