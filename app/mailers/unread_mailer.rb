class UnreadMailer < BaseMailer
  include ActionView::Helpers::TextHelper

  # helper :markdown
  # helper_method :today

  layout 'email'

  def unread_content(user_id, unread_articles=[])
    mailgun_tag 'digest#unread'

    @user = User.find(user_id)

    mention_groups = [@user.username]
    wip_group = WipGroup.new(
      ReadRaptorSerializer.deserialize(unread_articles),
      mention_groups
    )

    if wip_group.nil?
      mail.perform_deliveries = false
    else
      @products = wip_group.products
      @watchers = wip_group.watchers.take(30) # 30 happy faces
      @mentions = wip_group.events_with_mentions

      mail to: @user.email,
           subject: "#{pluralize wip_group.count, 'update'} on #{wip_group.product_names.to_sentence}"
    end
  end
end