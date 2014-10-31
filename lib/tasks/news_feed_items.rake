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

  task :process_work => :environment do
    GITHUB = User.find_by(username: 'GitHub')

    Work.where('created_at >= ?', 2.days.ago).
    group_by(&:product).each do |product, work|
      if work.count > 1
        shas = []
        users = work.map do |w|
          next unless username = w.user.try(:username)
          shas << w.metadata['sha']
          "<li>@#{username}: <a href=\"#{w.url}\">#{w.metadata['message']}</a></li>"
        end

        message = "<ul>#{users.join('')}</ul>"

        url = if shas.any?
          work.first.url.gsub!(/commit\/.*/, "compare/#{shas.first}...#{shas.last}")
        end

        title = if url
          "[#{work.count} commits pushed in the past day](#{url})"
        else
          "[#{work.count} commits pushed in the past day](#{work.first.url})"
        end

        product.news_feed_items.create(
          source: GITHUB,
          target: NewsFeedItemPost.create(title: title, description: message)
        )
      end
    end
  end
end
