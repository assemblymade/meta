namespace :discussions do
  task convert_to_posts: :environment do
    Discussion.all.each do |discussion|
      next if discussion.product.nil?
      next if Post.where(title: discussion.title, product: discussion.product).any?
      next if Post.where(slug: discussion.title.parameterize, product: discussion.product).any?

      post = Post.create!(
        author: discussion.user,
        body: "",
        created_at: discussion.created_at,
        flagged_at: discussion.flagged_at,
        product: discussion.product,
        slug: discussion.title.parameterize,
        title: discussion.title,
        updated_at: discussion.updated_at
      )

      nfi = post.news_feed_item

      discussion.comments.each do |comment|
        NewsFeedItemComment.create(
          body: comment.body,
          # created_at: comment.created_at,
          news_feed_item: nfi,
          target_id:  post.id,
          user: comment.user
        )
      end
    end
  end

  task dedupe: :environment do
    NewsFeedItem.group(:target_id).having('count(*) > 1').count.keys.each do |key|
      nfi_deleted = false

      NewsFeedItem.where(target_id: key).each do |nfi|
        next if nfi_deleted

        if nfi.comments.count == 0
          nfi.delete
          nfi_deleted = true
        end
      end
    end
  end

  task remove_main_threads: :environment do
    NewsFeedItem.where(target_type: 'Post').each do |nfi|
      if nfi.target.try(:title) == 'Main thread'
        post = nfi.target
        post.delete
        nfi.delete
      end
    end
  end
end
