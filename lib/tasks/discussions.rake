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

        if nfi.news_feed_item_comments.count == 0
          nfi.delete
          nfi_deleted = true
        end
      end
    end
  end

  task reset_comment_created_at: :environment do
    NewsFeedItem.where(target_type: 'Post').each do |nfi|
      if nfi.comments.any?
        nfi.comments.each do |comment|
          youngest = Time.new(2014)

          if event = Event::Comment.find_by(user: comment.user, body: comment.body)
            comment.update(created_at: event.created_at)

            if event.created_at > youngest
              youngest = event.created_at
            end
          end

          nfi.update(last_commented_at: youngest)
        end
      else
        nfi.update(last_commented_at: nfi.target.created_at)
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
