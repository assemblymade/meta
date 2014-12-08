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

  task mark_as_discussion: :environment do
    mark = Mark.find_or_create_by!(name: 'discussion')

    Post.all.each do |post|
      Marking.create!(markable: post, mark: mark, weight: 1.0)
    end
  end
end
