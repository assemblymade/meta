class CommentMailer < BaseMailer
  helper :app_icon
  helper :firesize
  helper :markdown

  layout 'new_email'

  def mentioned(user_id, comment_id)
    @user = User.find(user_id)
    @comment = NewsFeedItemComment.find(comment_id)
    @nfi = @comment.news_feed_item

    @target = target_name(@nfi)

    mailgun_tag 'comment_mentions'
    @email_description = 'all @mention emails'
    @fun = 'You must be so popular'

    mail   to: @user.email,
      subject: "@#{@comment.user.username} mentioned you on #{@target}"
  end

  def new_comment(user_id, comment_id)
    @user = User.find(user_id)
    @comment = NewsFeedItemComment.find(comment_id)
    @nfi = @comment.news_feed_item
    @product = @nfi.product

    @target = target_name(@nfi)

    thread_parts = [@nfi.id]
    message_parts = [@comment.id]
    options = list_headers(NewsFeedItem.to_s, @nfi.id, @user.username, thread_parts, message_parts, url_for(@comment.url_params)).merge(
      from: from_address_for(@comment.user),
      to:   @user.email,
      subject: "#{@target} in #{@product.name}"
    )

    mail(options) do |format|
      format.html { render layout: nil }
    end
  end

  def url_test
    @user = User.find_by!(username: 'whatupdave')

    @comment = NewsFeedItemComment.find('dee8ec69-0901-4699-b6b0-b0b6e9e7d1b7')

    mail to: @user.email, subject: 'URL testing'
  end
end
