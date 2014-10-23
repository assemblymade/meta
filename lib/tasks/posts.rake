namespace :posts do
  task :push_to_news_feed => :environment do
    Post.where(created_at: 4.weeks.ago..Time.now).each do |post|
      NewsFeedItem.create(
        product: post.product,
        source_id: post.user.id,
        target: post
      )
    end
  end
end
