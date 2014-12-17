class CommentMailer < BaseMailer
  helper :app_icon
  helper :firesize

  layout 'new_email'

  def mentioned(user_id, comment_id)
    @user = User.find(user_id)
    @comment = NewsFeedItemComment.find(comment_id)
    @nfi = @comment.news_feed_item

    @owner = @nfi.source == @user ? 'owner' : 'other'
    target_type = @comment.news_feed_item.target.class.name.underscore
    @target = I18n.t("stories.subjects.#{target_type}.#{@owner}", @comment.news_feed_item.target.attributes.symbolize_keys)

    mailgun_tag 'comment_mentions'
    @email_description = 'all @mention emails'
    @fun = 'You must be so popular'


    mail   to: @user.email,
      subject: "@#{@comment.user.username} mentioned you on #{@target}"
  end
end
