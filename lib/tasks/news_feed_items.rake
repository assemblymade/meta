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
    if Time.now.tuesday?
      GITHUB = User.find_by(username: 'GitHub')

      Work.where('created_at >= ?', 2.days.ago).
      group_by(&:product).each do |product, work|
        next unless work.count > 5

        shas = []
        users = work.map do |w|
          shas << w.metadata['sha']
          w.user.try(:username)
        end.reduce({}) do |memo, username|
          if memo[username]
            memo[username] = memo[username] + 1
          else
            memo[username] = 1
          end

          memo
        end

        message = "<ul>"

        users.map do |username, commits|
          if commits == 1
            message = message + "<li>@#{username}: #{commits} commit</li>"
          else
            message = message + "<li>@#{username}: #{commits} commits</li>"
          end
        end

        url = if shas.any?
          work.first.url.gsub!(/commit\/.*/, "compare/#{shas.first}...#{shas.last}")
        else
          work.last.url
        end

        title = "#{work.count} commits pushed this week"

        message = message + "</ul>"

        product.news_feed_items.create(
          source: GITHUB,
          target: NewsFeedItemPost.create(title: title, description: message, url: url)
        )
      end
    end
  end
end
