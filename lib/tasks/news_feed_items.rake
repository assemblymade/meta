namespace :news_feed_items do
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

  task retroactively_push_intros_to_chat: :environment do
    include MarkdownHelper
    NewsFeedItem.where(target_type: 'TeamMembership').each do |item|
      if item.comments.any?
        target = item.target
        wip = target.product.main_thread

        item.comments.each do |comment|
          event = Event.create_from_comment(
            wip,
            Event::Comment,
            product_markdown(target.product,
              "_" + comment.body + "_"
            ),
            comment.user
          )

          Activities::Chat.publish!(
            actor: event.user,
            subject: event,
            target: wip
          )
        end
      end
    end
  end

  task repopulate_comments: :environment do
      Event::Comment.all.each do |comment|
        if nfi = NewsFeedItem.find_by(target_id: comment.wip_id)
          NewsFeedItemComment.delete_all(news_feed_item_id: nfi.id)

          nfi.comments.create(
            user_id: comment.user_id,
            body: comment.body,
            created_at: comment.created_at,
            updated_at: comment.updated_at,
            target_id: comment.id
          )

          nfi.update(last_commented_at: comment.created_at)
        end
      end
  end
end
