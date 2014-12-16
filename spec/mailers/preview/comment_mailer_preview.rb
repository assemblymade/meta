class CommentMailerPreview < ActionMailer::Preview
  def mentioned
    comment = NewsFeedItemComment.where("body ilike '% @%'").random.find{|c| c.mentioned_users.size > 0 }
    CommentMailer.mentioned(comment.mentioned_users.first.id, comment.id)
  end
end
