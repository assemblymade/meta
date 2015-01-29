class CommentMailerPreview < ActionMailer::Preview
  def mentioned
    comment = NewsFeedItemComment.where("body ilike '% @%'").random.find{|c| c.mentioned_users.size > 0 }
    CommentMailer.mentioned(comment.mentioned_users.first.id, comment.id)
  end

  def new_comment
    # comment = NewsFeedItemComment.where("body ilike '%http%'").sample
    comment = NewsFeedItemComment.joins(:news_feed_item).
                where(news_feed_items: { target_type: Idea}).sample
    CommentMailer.new_comment(comment.news_feed_item.source_id, comment.id)
  end
end
